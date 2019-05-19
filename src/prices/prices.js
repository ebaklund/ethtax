'use strict';

const norgesbank = require('../exchanges/norgesbank');

let _usdRates;

async function getUsdRates() {
  if (!_usdRates)
    _usdRates = await norgesbank.requestUsdRates('2018', '2019');

  return _usdRates;
}

function cmpKeys(k1, k2) {
  const ka1 = k1.split('-');
  const ka2 = k2.split('-');

  const n1 = Number(ka1[0]) * 10000 + Number(ka1[1]) * 100 + Number(ka1[2]);
  const n2 = Number(ka2[0]) * 10000 + Number(ka2[1]) * 100 + Number(ka2[2]);

  return n1 - n2;
}

async function getUsdRateFromKey(key) {
  const usdRates = await getUsdRates();
  if (usdRates[key])
    return usdRates[key];

  const keys = Object.keys(usdRates).reverse();

  for (const candidate of keys) {
    if (cmpKeys(candidate, key) < 0)
      return usdRates[candidate];
  }

  throw new Error('Failed to find price')
}

function getKeyFromDate(date) {
  const key = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate();
  return key;
}

async function getUsdRateFromDate(date) {
  return getUsdRateFromKey(getKeyFromDate(date));
}

async function getNokFromUsd(date, usd) {
  const rate = await getUsdRateFromDate(date);
  const nok = usd * rate;
  return nok;
}

module.exports = {
  getUsdRateFromDate,
  getKeyFromDate,
  getNokFromUsd
};
