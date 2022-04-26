const config = require('config');
const Transaction = require('./transaction');
const { ec, cryptoHash } = require('../util');

class Wallet {
    constructor() {
        this.balance = config.get('starting-balance');

        this.keyPair = ec.genKeyPair();
        
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
      return this.keyPair.sign(cryptoHash(data));
    };

    createTransaction({ receivingAddress, amount }) {
      if (amount > this.balance) {
        throw new Error('Amount exceeds balance.');
      }

      return new Transaction({ 
        senderWallet: this,
        receivingAddress,
        amount
       });
    };
  };

module.exports = Wallet;