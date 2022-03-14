const config = require('config');
const cryptoHash = require('./crypto-hash');

class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(config.get('genesis-block'));
    }

    static mineBlock({ lastBlock, data }) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        const { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce ++;
            timestamp = Date.now();
            hash = cryptoHash(
                timestamp,
                lastHash,
                data,
                nonce,
                difficulty
            );

        } while (hash.substring('0', difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            lastHash,
            data,
            nonce,
            difficulty,
            hash
        });
    }
}

module.exports = Block;