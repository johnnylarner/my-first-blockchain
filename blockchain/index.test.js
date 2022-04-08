const Block = require('./block');
const Blockchain = require('.');
const { cryptoHash } = require('../util');

describe('Blockchain', () => {

    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('can add a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length-1].data)
            .toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis'};

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block \
                    and has multiple blocks', () => {
            
            beforeEach(() => {
                blockchain.addBlock({ data: 'taz' });
                blockchain.addBlock({ data: 'zoo' });
                blockchain.addBlock({ data: 'too' });
                blockchain.addBlock({ data: 'dir' });
            });

            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[3].lastHash = 'wrong-lastHash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'wrong-data'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with a jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];

                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = []; 
                    const jumpedDifficulty = lastBlock.difficulty - 3;

                    const hash = cryptoHash(
                        timestamp,
                        lastHash,
                        nonce,
                        data,
                        jumpedDifficulty
                    );

                    const badBlock = new Block({
                        timestamp,
                        lastHash,
                        nonce,
                        data,
                        difficulty: jumpedDifficulty,
                        hash
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });

            });

            describe('and the chain does not contain any invalid bocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;

            blockchain.addBlock({ data: 'taz' });
            blockchain.addBlock({ data: 'zoo' });

            newChain.addBlock({ data: 'too' });
            newChain.addBlock({ data: 'dir' });
        });

        describe('when new chain is not longer', () => {
            beforeEach(() => {
                blockchain.replaceChain(newChain.chain);                
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is longer', () => {
            
            beforeEach(() => {
                newChain.addBlock({ data: 'far'});
                newChain.addBlock({ data: 'maz'});
            });

            describe('and the chain is not valid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'fake-hash';
    
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                }); 

                it('logs a chain replacement.', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});