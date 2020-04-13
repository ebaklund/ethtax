'use strict';

const cryptocompare = require('./cryptocompare');
const norgesbank = require('./norgesbank');

async function getNokFrom(symbol, date, value) {
  const usd = symbol === 'USD'
    ? value
    : await cryptocompare.getUsdFrom(symbol, date, value);
  const nok = await norgesbank.getNokFromUsd(date, usd);
  return nok;
}

module.exports = {
  getNokFromUsd: norgesbank.getNokFromUsd,
  getUsdFrom: cryptocompare.getUsdFrom,
  getNokFrom
};
