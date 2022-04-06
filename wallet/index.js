const config = require('config');
const { ec } = require('../util');

class Wallet {
    constructor() {
        this.balance = config.get('starting-balance');

        const keyPair = ec.genKeyPair();
        
        this.publicKey = keyPair.getPublic().encode('hex');
    }
};

module.exports = Wallet;