const Block = require("./block");
const config = require('config');

describe('Block', () => {
 // Jest function with name of test
 // For each attribute of the block class
 // As well as the class itself
 // Lets setup some test data
    const timestamp = 'a-date';
    const lastHash = 'foo-bar';
    const hash = 'bar-foo';
    const data = ['blockhain', 'data'];
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
});

