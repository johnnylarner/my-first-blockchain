const hexToBinary = require('hex-to-binary');
const config = require('config');
const { cryptoHash } = require('../util');
const MINE_RATE = config.get('mine-rate');

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
        const lastHash = lastBlock.hash;
        let hash, timestamp;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce ++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({
                originalBlock: lastBlock, timestamp
            });

            hash = cryptoHash(
                timestamp,
                lastHash,
                data,
                nonce,
                difficulty
            );

        } while (hexToBinary(hash).substring('0', difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            lastHash,
            data,
            nonce,
            difficulty,
            hash
        });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock;

        if (difficulty < 1) return 1;

        if ((timestamp - originalBlock.timestamp) > MINE_RATE) {
            return difficulty - 1;
        }

        return difficulty + 1;
    }
}

module.exports = Block;