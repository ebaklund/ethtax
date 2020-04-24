'use strict';

const t = require('flow-runtime');
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

async function logEtherscanWallet(symbol, addr, yearEnd) {
  t.string().assert(symbol);
  t.string().assert(addr);
  t.class(Date).assert(yearEnd);

  const recs = await etherscan.getRecordsFromSymbol(symbol, addr);
  const balanceValue = await etherscan.getLatestBalanceFromSymbol(symbol, addr);
  const yearendRec = await recUtils.getBalanceRecordAtDate(symbol, yearEnd, recs);
  logRecords('ETHERSCAN', addr, recs);
  logBalanceValue(symbol, balanceValue);
  logYearendRecord(yearendRec);
}

(async () => {
  console.log('Årsoppgaver kryptocvaluta');
  console.log('-------------------------');

  const yearEnd = new Date(2019, 12-1, 31);

  for (const addr of config.addresses) {
    if (!(/0x1ce555afbd5b5f837147bcae8762ad7779e0b6d6/i.test(addr)))
      continue;

    let recs, balanceValue, yearendRec;
/*
    recs = await idex.getRecordsFromSymbol('ETH', addr);
    logRecords('IDEX', 'ETH', addr, recs);
    logBalanceRecord(await getBalanceRecordAt('ETH', yearEnd, recs));

    recs = await idex.getRecordsFromSymbol('HBT', addr);
    logRecords('IDEX', 'HBT', addr, recs);
    logBalanceRecord(await getBalanceRecordAt('HBT', yearEnd, recs));
*/
    await logEtherscanWallet('ETH', addr, yearEnd)
    // await logEtherscanWallet('HBT', addr, yearEnd)
  }
})();
