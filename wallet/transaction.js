const uuid = require('uuid');

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
};

module.exports = Transaction;