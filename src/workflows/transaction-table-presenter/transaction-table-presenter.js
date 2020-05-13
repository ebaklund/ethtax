'use strict';

const AsyncChain = require('@hubiinetwork/async-chain');

const config = require('../../app/config');
const CoinbaseAccessor = require('../accessors/accounts/coinbase');
const EtherscanAccessor = require('../accessors/accounts/etherscan');
const IdexAccessor = require('../accessors/accounts/idex');
const assembler = require('../engines/accaunt-info-pricer');
const formatter = require('../engines/transaction-table-formatter');

async function showTransactions (date) {
  await AsyncChain.from(
    new CoinbaseAccessor(config.coinbase.apiKey, config.coinbase.apiSecret),
    new EtherscanAccessor(config.etherscan.apiKey, config.addresses),
    new IdexAccessor(config.etherscan.apiKey, config.addresses),
  )
    .map(accessor => {
      return accessor.getAccountInfos();
    })
    .flat()
    .map(async accountInfo => {
      const txTable = await assembler.getTransactionsTable(accountInfo, date);
      const textTable = formatter.getFormattedTransactionTable(txTable);
      console.log(textTable);
      console.log('');

      return textTable;
    })
    .reduce((arr, textTable) => {
      return (arr.push(textTable), arr);
    }, []);
}

module.exports = {
  showTransactions
};