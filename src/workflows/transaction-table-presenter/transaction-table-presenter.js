'use strict';

const fs = require('fs');
const AsyncChain = require('@hubiinetwork/async-chain');

const config = require('../../app/config');
const CoinbaseAccessor = require('../accessors/accounts/coinbase');
const EtherscanAccessor = require('../accessors/accounts/etherscan');
const IdexAccessor = require('../accessors/accounts/idex');
const tableBuilder = require('../engines/transaction-table-builder');
const tableFormatter = require('../engines/transaction-table-formatter');

const t = require('flow-runtime');

let _transactionTables;

async function getTransactionTables (date) {
  t.class(Date).accepts(date);

  if (!_transactionTables) {
    _transactionTables = await AsyncChain.from(
      new CoinbaseAccessor(config.coinbase.apiKey, config.coinbase.apiSecret),
      new EtherscanAccessor(config.etherscan.apiKey, config.addresses),
      new IdexAccessor(config.etherscan.apiKey, config.addresses),
    )
      .map(accessor => accessor.getAccountInfos())
      .flat()
      .map(async accountInfo => await tableBuilder.getTransactionsTable(accountInfo, date))
      .reduce((arr, textTable) => (arr.push(textTable), arr), []);
  }

  return _transactionTables;
}

function mkOutDir (date) {
  const outDir = `./Skatt/${date.getFullYear()}`;
  fs.mkdirSync(outDir, { recursive: true });

  return outDir;
}

async function showTransactions (date) {
  t.class(Date).accepts(date);

  const outDir = mkOutDir(date);
  const filePath = `${outDir}/Transaction-tables-${date.getFullYear()}.txt`;
  fs.writeFileSync(filePath, '');

  const txTables = await getTransactionTables(date);

  txTables
    .map(txTable => tableFormatter.getFormattedTransactionTable(txTable))
    .forEach(textTable => {
      fs.writeFileSync(filePath, textTable + '\n', {flag: 'a'});
      console.log(textTable, '\n');
    });
}

async function showTaxReport (date) {
  t.class(Date).accepts(date);

  const txTables = await getTransactionTables(date);
  const textTable = tableFormatter.getFormattedTaxReport(date, txTables);

  const outDir = mkOutDir(date);
  const filePath = `${outDir}/Kryptovaluta-${date.getFullYear()}.csv`;
  fs.writeFileSync(filePath, textTable);

  console.log(textTable, '\n');

}

module.exports = {
  showTransactions,
  showTaxReport
};