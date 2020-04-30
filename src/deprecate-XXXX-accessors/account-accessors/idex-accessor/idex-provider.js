'use strict';

const assert = require('assert');

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

const superagent = require('superagent');

const NestedError = require('../../../../utils/nested-error');


async function getPagedRequest(url, payload) {
  let result = [];
  let idex_next_cursor = null;

  while (idex_next_cursor !== undefined) {
    if (idex_next_cursor)
      payload['cursor'] = idex_next_cursor;

    try {
      const res = await superagent
      .post(url)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(payload));

      const values = Object.values(res.body);
      for (const arr of Object.values(res.body))
        result = result.concat(arr);

      idex_next_cursor = res.headers['idex-next-cursor'];
    }
    catch (err) {
      throw new NestedError(err, 'Failed to do paged request from idex. ' + err.message);
    }
  }

  return result;
}

const _tradeHistory = {};

async function getTradeHistory(market, addr) {
  const key = market + '/' + addr;

  if (!_tradeHistory[key]) {
    const payload = { market: market, address: addr, sort: "asc",  count: 100 };
    _tradeHistory[key] = await getPagedRequest('https://api.idex.market/returnTradeHistory', payload);
  }

  return _tradeHistory[key];
}

const _balanceHistory = {};

async function getBalanceHistory(addr) {
  if (!_balanceHistory[addr]) {
    const payload = { address: addr, sort: "asc", count: 100 };
    _balanceHistory[addr] = getPagedRequest('https://api.idex.market/returnDepositsWithdrawals', payload);
  }

  return _balanceHistory[addr];
}

module.exports = {
  getTradeHistory,
  getBalanceHistory
};
