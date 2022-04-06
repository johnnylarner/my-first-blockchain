const hexToBinary = require('hex-to-binary');
const Block = require("./block");
const config = require('config');
const cryptoHash = require("../util/crypto-hash");

describe('Block', () => {
    const MINE_RATE = config.get('mine-rate');
    const timestamp = 2000;
    const lastHash = 'foo-bar';
    const hash = 'bar-foo';
    const data = ['blockchain', 'data'];
    const nonce = 232;
    const difficulty = 5;
    const block = new Block({
        timestamp,lastHash, hash, data, nonce, difficulty
    });

    it('has ts, lashHash, hash, data properties', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
        
        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block ).toBe(true)
        });

        it ('returns the genesis data in config', () => {
            expect(genesisBlock).toEqual(config.get('genesis-block'));
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const nonce = 232;
        const difficulty = 5;
        const minedBlock = Block.mineBlock({ 
            lastBlock, data, nonce, difficulty
        });

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block ).toBe(true)
        });

        it('sets the `lastHash` to the `hash` of lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data)
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA-256 hash based on the proper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                    cryptoHash(
                        minedBlock.timestamp, 
                        lastBlock.hash, 
                        minedBlock.nonce, 
                        minedBlock.difficulty, 
                        data
                    )
                );
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });

        it('creates a `hash` meeting the diffculty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, [minedBlock.difficulty]))
                .toEqual('0'.repeat(minedBlock.difficulty))
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty if a block is mined quickly', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty+1);
        });
        
        it('lowers the difficulty if a block is mined slowly', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty-1);
        });

        it('has a lower limit of one', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({ originalBlock: block})).toEqual(1);
        });
    });
});

