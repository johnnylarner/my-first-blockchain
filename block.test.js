const Block = require("./block");
const config = require('config');
const cryptoHash = require("./crypto-hash");

describe('Block', () => {
 // Jest function with name of test
 // For each attribute of the block class
 // As well as the class itself
 // Lets setup some test data
    const timestamp = 'a-date';
    const lastHash = 'foo-bar';
    const hash = 'bar-foo';
    const data = ['blockchain', 'data'];
    const block = new Block({timestamp,lastHash, hash, data});

    it('has ts, lashHash, hash, data properties', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
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
        const minedBlock = Block.mineBlock({ lastBlock, data });

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
                        data
            ));
        });
    });
});

