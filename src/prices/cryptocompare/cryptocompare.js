'use strict';

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

const superagent = require('superagent');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');


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

function isValidSymbol(symbol) {
  const found = [ 'ETH', 'HBT', 'NII', 'AURA' ].find(s => s === symbol);
  return !!found;
}

let _rates = {};

async function getRatesFrom (symbol) {
  if (!isValidSymbol(symbol))
    throw new Error (`Failed to validate symbol: ${symbol}`);

  if (!_rates[symbol]) {
    if (symbol === 'NII') {
      const hbtRates = await getRatesFrom('HBT');
      _rates[symbol]  = hbtRates.map(item => Object.assign({}, item, { usd: item.usd / 1000 }));
    }
    else {
      _rates[symbol] = await requestRates(symbol);
    }
  }

  return _rates[symbol];
}

async function getUsdFrom(symbol, date, value=1) {
  const rates = await getRatesFrom(symbol);
  const date2 = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ));
  const key = date2.toISOString().split("T")[0];
  const item = rates.find(item => item.key <= key);

  return item.usd * value;
}

module.exports = {
  getUsdFrom
};
