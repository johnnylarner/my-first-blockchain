const Transaction = require('./transaction');
const Wallet = require('.');
const { verifySignature } = require('../util');

describe('Transaction', () =>{
  let transaction, senderWallet, receivingAddress, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    receivingAddress = 'receiving-address-string';
    amount = 50;
    transaction = new Transaction({ senderWallet, receivingAddress, amount })
  });

  it('has an `id`', () =>{
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('has an `outputMap`', () =>{
      expect(transaction).toHaveProperty('outputMap');
    });

    it('outputs the amount', () =>{
      expect(transaction.outputMap[receivingAddress]).toEqual(amount);
    });

    it('outputs the remaining balance of the `senderWallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey])
        .toEqual(senderWallet.balance - amount);
    });
    
  });

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('has a `timestamp`', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('sets the `amount` to the `senderWallet` `balance`', () =>{
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` `publicKey`', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature
        }))
        .toBe(true);
    });
  });
});