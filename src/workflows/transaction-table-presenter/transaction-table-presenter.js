'use strict';

const AsyncChain = require('@hubiinetwork/async-chain');

const config = require('../../app/config');
const CoinbaseAccessor = require('../accessors/accounts/coinbase');
const assembler = require('../engines/report-assembler');
const formatter = require('../engines/report-formatter');

async function showTransactions (date) {
  await AsyncChain.from(
    new CoinbaseAccessor(config.coinbase.apiKey, config.coinbase.apiSecret)
  )
    .map(accessor => {
      return accessor.getAccountInfos();
    })
    .flat()
    .map(accountInfo => {
      return assembler.getTransactionsTable(accountInfo, date);
    })
    .map(txTable => {
      return formatter.getFormattedTransactionTable(txTable);
    })
    .forEach(text => {
      console.log(text);
      console.log('');
    })
    .reduce((arr, text) => {
      return (arr.push(text), arr);
    }, []);
}

module.exports = {
  showTransactions
};