'use strict';

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

const superagent = require('superagent');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');

function getKeyFromTimestamp (timestamp) {
  const date = new Date(timestamp);
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;
  return key;
}

async function requestRates(symbol) {
  const query = `https://min-api.cryptocompare.com/data/histoday?fsym=${symbol}&tsym=USD&limit=1000`;

  const res = await superagent
    .get(query)
    .set('Content-Type', 'application/json');

  const Rates = res.body.Data
    .sort((a,b) => b.time - a.time)
    .map(item => ({
      key: (new Date(item.time * 1000)).toISOString().split('T')[0],
      usd: item.close
    }));

  return Rates;
}

let _ethRates;

async function requestEthRates () {
  if (!_ethRates)
    _ethRates = requestRates('ETH');

  return _ethRates;
}

let _hbtRates;

async function requestHbtRates () {
  if (!_hbtRates)
    _hbtRates = requestRates('HBT');

  return _hbtRates;
}

let _niiRates;

async function requestNiiRates () {
  if (!_niiRates) {
    const hbtRates = await requestHbtRates();
    _niiRates = hbtRates.map(item => Object.assign({}, item, { usd: item.usd / 1000 }));
  }

  return _niiRates;
}

async function getUsdFromToken(date, tokenAmount=1, rates) {
  const key = date.toISOString().split('T')[0];
  const item = rates.find(item => item.key <= key);

  return item.usd * tokenAmount;
}

async function getUsdFromEth(date, eth=1) {
  const usd = getUsdFromToken(date, eth, await requestEthRates());
  return usd;
}

async function getUsdFromHbt(date, hbt=1) {
  const usd = getUsdFromToken(date, hbt, await requestHbtRates());
  return usd;
}

async function getUsdFromNii(date, nii=1) {
  const usd = getUsdFromToken(date, nii, await requestNiiRates());
  return usd;
}

module.exports = {
  requestEthRates,
  requestHbtRates,
  requestNiiRates,
  getUsdFromEth,
  getUsdFromHbt,
  getUsdFromNii
};
