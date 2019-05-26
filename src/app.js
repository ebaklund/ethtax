'use strict';

const superagent = require('superagent');

const config = require('./config');
const NestedError = require('./utils/nested-error');
const etherscan = require('./exchanges/etherscan');
const coinbase = require('./exchanges/coinbase');
const idex = require('./exchanges/idex');
const prices = require('./prices');
const recUtils = require('./records/record-utils');

let keepaliveExitPromise;

process.on('unhandledRejection', (err /*, promise*/) => {
  console.log('\n\nError: ' + NestedError.asStringified(err));
  keepaliveExitPromise = new Promise((resolve, reject) => setTimeout(() => process.exit(0), 1000));
  throw err;
});

console.log('etherscan_key: ' + config.etherscan.apiKey);
console.log('cmc_key: ' + config.coinmarketcap.apiKey);
console.log(' ');

function logRecords(exchange, addr, recs) {
  console.log(' ');
  console.log(`${exchange} ${addr}`);
  for (const rec of recs)
    console.log(recUtils.fmtRecord(rec));
}

function logBalanceValue(symbol, balanceValue) {
  console.log(recUtils.fmtBalanceValue(symbol, balanceValue));
}

function logYearendRecord(yearendRec) {
  console.log(recUtils.fmtBalanceRecord(yearendRec));
}

(async () => {
  console.log('Årsoppgaver kryptocvaluta 2018');
  console.log('------------------------------');

  const yearEnd = new Date(2018, 12-1, 31);

  for (const addr of config.addresses) {
    let recs, balanceValue, yearendRec;
/*
    recs = await idex.getRecordsFromSymbol('ETH', addr);
    logRecords('IDEX', 'ETH', addr, recs);
    logBalanceRecord(await getBalanceRecordAt('ETH', yearEnd, recs));

    recs = await idex.getRecordsFromSymbol('HBT', addr);
    logRecords('IDEX', 'HBT', addr, recs);
    logBalanceRecord(await getBalanceRecordAt('HBT', yearEnd, recs));
*/
/*
    recs = await etherscan.getRecordsFromSymbol('ETH', addr);
    balanceValue = await etherscan.getLatestBalanceFromSymbol('ETH', addr);
    yearendRec = await recUtils.getBalanceRecordAtDate('ETH', yearEnd, recs);
    logRecords('ETHERSCAN', addr, recs);
    logBalanceValue('ETH', balanceValue);
    logYearendRecord(yearendRec);
*/
/*
    recs = await etherscan.getRecordsFromSymbol('HBT', addr);
    balanceValue = await etherscan.getLatestBalanceFromSymbol('HBT', addr);
    yearendRec = await recUtils.getBalanceRecordAtDate('HBT', yearEnd, recs);
    logRecords('ETHERSCAN', addr, recs);
    logBalanceValue('HBT', balanceValue);
    logYearendRecord(yearendRec);
*/
    const symbol = 'AURA';
    recs = await etherscan.getRecordsFromSymbol(symbol, addr);
    balanceValue = await etherscan.getLatestBalanceFromSymbol(symbol, addr);
    yearendRec = await recUtils.getBalanceRecordAtDate(symbol, yearEnd, recs);
    logRecords('ETHERSCAN', addr, recs);
    logBalanceValue(symbol, balanceValue);
    logYearendRecord(yearendRec);
  }
})();
