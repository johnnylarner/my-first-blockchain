const config = require('config');
const { ec } = require('../util');
const cryptoHash = require('../util/crypto-hash');
const hexToBinary = require('hex-to-binary');
const Signature = require('elliptic/lib/elliptic/ec/signature');

class Wallet {
    constructor() {
        this.balance = config.get('starting-balance');

        this.keyPair = ec.genKeyPair();
        
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign( data ) {
      return this.keyPair.sign(cryptoHash(data));
    };
  };

module.exports = Wallet;