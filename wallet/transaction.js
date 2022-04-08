const { TimeSeriesReducers } = require('@node-redis/time-series/dist/commands');
const uuid = require('uuid');
const { verifySignature } = require('../util');

class Transaction {
  constructor({ senderWallet, receivingAddress, amount }) {
    this.id = uuid.v1();
    this.senderWallet = senderWallet;
    this.outputMap = this.createOutputMap({ senderWallet, receivingAddress, amount });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  };

  createOutputMap({ senderWallet, receivingAddress, amount }) {
    const outputMap = {};

    outputMap[receivingAddress] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    
    return outputMap
  };

  createInput({ senderWallet, outputMap }) {
    
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  };

  static validTransaction(transaction) {

    const { input: {address, amount, signature} , outputMap } = transaction;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount);

    if ( outputTotal !== amount) {
      console.error(`An invalid outputMap for a transaction was send from this address ${address}`);
      return false;
    }

    if (! verifySignature({ publicKey: address,  data: outputMap, signature })) {
      console.error(`An invalid signature was provided from this address ${address}`);
      return false;
    }

    return true;
  };
};

module.exports = Transaction;