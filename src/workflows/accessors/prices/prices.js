'use strict';

require('../../../runtime-types/valid-float');
const t = require('flow-runtime');

const cryptocompare = require('./cryptocompare');
const norgesbank = require('./norgesbank');

async function getNokFrom(symbol, date, value) {
  t.string().assert(symbol);
  t.class(Date).assert(date);
  t.ValidFloat().assert(value);

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
