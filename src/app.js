'use strict';

const superagent = require('superagent');

const config = require('./config');
const NestedError = require('./utils/nested-error');
const etherscan = require('./exchanges/etherscan');
//const norgesbank = require('./exchanges/norgesbank');
const coinbase = require('./exchanges/coinbase');
const idex = require('./exchanges/idex');
const prices = require('./prices');

let keepaliveExitPromise;

function fmtCurr(curr) {

  const text = ((curr < 0) ? '' : ' ') + curr.toFixed(4);
  const indent = Math.max(0, 12 - text.length);
  return ' '.repeat(indent) + text;
}

process.on('unhandledRejection', (err /*, promise*/) => {
  console.log('\n\nError: ' + NestedError.asStringified(err));
  keepaliveExitPromise = new Promise((resolve, reject) => setTimeout(() => process.exit(0), 1000));
  throw err;
});

console.log('etherscan_key: ' + config.etherscan.apiKey);
console.log('cmc_key: ' + config.coinmarketcap.apiKey);
console.log(' ');

function logRecords(exchange, symbol, addr, records) {
  console.log(' ');
  console.log(`${exchange} ${addr}`);
  const smb = symbol.toLowerCase();
  for (const rec of records) {
    let line = '';
    line += `${symbol}, ${rec.action}, ${rec.isoDate}, `;
    line += `${fmtCurr(rec.token.value)} ${smb}, ${fmtCurr(rec.token.balance)} ${smb}, `;
    line += `${fmtCurr(rec.usd.value)} usd, ${fmtCurr(rec.usd.balance)} usd, `;
    line += ` ${fmtCurr(rec.nok.value)} nok, ${fmtCurr(rec.nok.balance)} nok`;
    console.log(line);
  }
}

async function getBalanceRecordAt(symbol, date, records) {
  const rec = records.reverse().find(rec => rec.date.valueOf() <= date.valueOf());
  const tok = rec ? rec.token.balance : 0;
  const usd = rec ? await prices.getUsdFrom(rec.symbol, date, tok) : 0;
  const nok = rec ? await prices.getNokFrom(rec.symbol, date, tok) : 0;
  return { symbol: symbol, date: date, tok: tok, usd: usd, nok: nok };
}

function logBalanceRecord(rec) {
    const smb = rec.symbol.toLowerCase();
    let line = '';
    line += `Årslutt ${rec.date.toISOString()}, `;
    line += `                  ${fmtCurr(rec.tok)} ${smb}, `;
    line += `                  ${fmtCurr(rec.usd)} usd, `;
    line += `                   ${fmtCurr(rec.nok)} nok`;
    console.log(line);
}

(async () => {
  console.log('Årsoppgaver kryptocvaluta 2018');
  console.log('------------------------------');

  const yearEnd = new Date(2018, 12-1, 31);

  for (const addr of config.addresses) {
    let recs;
    recs = await idex.getRecordsFromSymbol('ETH', addr);
    logRecords('IDEX', 'ETH', addr, recs);
    logBalanceRecord(await getBalanceRecordAt('ETH', yearEnd, recs));

    recs = await idex.getRecordsFromSymbol('HBT', addr);
    logRecords('IDEX', 'HBT', addr, recs);
    logBalanceRecord(await getBalanceRecordAt('HBT', yearEnd, recs));
  }
})();
