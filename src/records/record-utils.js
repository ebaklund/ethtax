'use strict';

const prices = require('../workflows/accessors/prices');

function fmtCurr(curr) {
  const text = ((curr < 0) ? '' : ' ') + curr.toFixed(4);
  const indent = Math.max(0, 12 - text.length);
  return ' '.repeat(indent) + text;
}

function fmtRecord(rec) {
  const smb = rec.symbol.toLowerCase();
  let line = '';
  line += `${rec.symbol}, ${rec.action}, ${rec.date.toISOString()}, `;
  line += `${fmtCurr(rec.tok.value)} ${smb}, ${fmtCurr(rec.tok.balance)} ${smb}, `;
  line += `${fmtCurr(rec.usd.usdTokRate)} usd/${smb}, ${fmtCurr(rec.usd.value)} usd, ${fmtCurr(rec.usd.balance)} usd, `;
  line += ` ${fmtCurr(rec.nok.nokUsdRate)} nok/usd, ${fmtCurr(rec.nok.value)} nok, ${fmtCurr(rec.nok.balance)} nok`;
  return line;
}

async function getBalanceRecordAtDate(symbol, date, recs) {
  const rec = recs.slice().reverse().find(rec => rec.date.valueOf() <= date.valueOf());
  const tok = rec ? rec.tok.balance : 0;
  const usdTokRate = rec ? await prices.getUsdFrom(rec.symbol, date, 1) : 0;
  const usd = rec ? await prices.getUsdFrom(rec.symbol, date, tok) : 0;
  const nokUsdRate = rec ? await prices.getNokFrom('USD', date, 1) : 0;
  const nok = rec ? await prices.getNokFrom(rec.symbol, date, tok) : 0;
  return { symbol, date, tok, usdTokRate, usd, nokUsdRate, nok };
}

function fmtBalanceValue(symbol, balanceValue) {
  const smb = symbol.toLowerCase();
  let line = '';
  line += 'x-sjekk                                             ';
  line += `${fmtCurr(balanceValue)} ${smb}`;
  return line;
}

function fmtBalanceRecord(rec) {
  const smb = rec.symbol.toLowerCase();
  let line = '';
  line += `Årslutt ${rec.date.toISOString()}, `;
  line += `                  ${fmtCurr(rec.tok)} ${smb}, `;
  line += `${fmtCurr(rec.usdTokRate)} usd/${smb},                   ${fmtCurr(rec.usd)} usd,  `;
  line += `${fmtCurr(rec.nokUsdRate)} nok/usd,                   ${fmtCurr(rec.nok)} nok`;
  return line;
}

module.exports = {
  fmtRecord,
  getBalanceRecordAtDate,
  fmtBalanceRecord,
  fmtBalanceValue
};
