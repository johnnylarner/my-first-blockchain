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
  
  describe('validTransaction()', () => {
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe('when the transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validTransaction( transaction )).toBe(true);
      });
    });
    
    describe('when the transaction is not valid', () => {
      
      describe('and a transaction outputMap is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[senderWallet.publicKey] = 99999999;
          expect(Transaction.validTransaction( transaction )).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
      
      describe('and a transaction input signature is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.input.signature = new Wallet().sign('data');
          expect(Transaction.validTransaction( transaction )).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    })
  });

  describe('update()', () => {
    let originalSenderOutput, originalSignature, currentRecipAmount, nextAmount, nextRecipient;
    
    beforeEach(() => {
      originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
      originalSignature = transaction.input.signature;
      currentRecipAmount = transaction.outputMap[receivingAddress];
      nextAmount = 50;
      nextRecipient = 'next-recip';

      transaction.update({ senderWallet, receivingAddress: nextRecipient, amount: nextAmount});
      transaction.update({ senderWallet, receivingAddress, amount: nextAmount});
    });

    describe('when the new amount exceeds the wallet balance', () => {
      it('throws an error', () => {
        expect(() => transaction.update( { senderWallet, receivingAddress, amount: 999_999_999}))
          .toThrow('Insufficient funds to update the transaction.');
      });
    });

    describe('when a valid amount is provided', () => {
      it('subtracts the amount from the sender output amount balance', () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - (2*nextAmount));
      });

      it('maintains a total output that matches the input amount', () => {
        expect(Object.values(transaction.outputMap)
          .reduce((total, outputAmount) => total + outputAmount))
            .toEqual(transaction.input.amount);
      });

      it('resigns the signature', () => {
        expect(transaction.input.signature).not.toEqual(originalSignature);
      });

      describe('and an existing address is updated', () => {
        it('updates the `amount` to be sent.', () => {
          expect(transaction.outputMap[receivingAddress]).toEqual(currentRecipAmount + nextAmount);
        });
      });
      
      describe('and a new address is added to the transaction', () => {
        it('adds it to the `outputMap`', () => {
          expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
        });
      });
    });
  });
});