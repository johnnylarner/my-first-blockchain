const Wallet = require('.');
const Transaction = require('./transaction');
const { verifySignature } = require('../util');
const { DNS } = require('uuid/dist/v35');

describe('Wallet', () =>{
  let wallet, receivingWallet

  beforeEach(() =>{
    wallet = new Wallet();
    receivingWallet = new Wallet();
  });

  it('has a `balance`', () =>{
    expect(wallet).toHaveProperty('balance');
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });
  
  describe('signing data', () =>{
    const data  = 'foobar';

    it('verifies a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it('does not verify an invalid signature', () =>{
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data)  
        }))
          .toBe(false);
    });
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the wallet balance', () => {
      it('throws an error', () => {
        expect( () => wallet.createTransaction({
          receivingAddress: receivingWallet.address,
          amount: 999_999_999
        })).toThrow('Amount exceeds balance.');
      });
    });

    describe('and the transaction amount is valid', () => {
      let transaction, amount, receivingAddress;

      beforeEach(() => {
        amount = 100;
        receivingAddress = receivingWallet.address;
        transaction = wallet.createTransaction({receivingAddress, amount});
      });

      it('creates an instance of the `Transaction class`', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it('maps the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('outputs the amount to the recipient', () => {
        expect(transaction.outputMap[receivingAddress]).toEqual(amount);
      });

      it('creates a valid `Transaction` object', () => {
        expect(Transaction.validTransaction(wallet.createTransaction({
          receivingAddress: receivingWallet.address,
          amount: 100
        })))
          .toBe(true);
      });
    });
  });
});