'use strict';

const assert = require('assert');

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

const superagent = require('superagent');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');
const prices = require('../../managers/accessors/prices');

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

async function getTradeHistory(market, addr) {
  const payload = { market: market, address: addr, sort: "asc",  count: 100 };
  return getPagedRequest('https://api.idex.market/returnTradeHistory', payload);
}

async function getBalanceHistory(addr) {
  const payload = { address: addr, sort: "asc", count: 100 };
  return getPagedRequest('https://api.idex.market/returnDepositsWithdrawals', payload);
}

function getCtActionFromTradeTx(addr, ct, tx) {
  if ((addr === tx.maker) && (ct === tx.tokenSell))
    return 'ms';

  if ((addr === tx.maker) && (ct === tx.tokenBuy))
    return 'mb';

  if ((addr === tx.taker) && (ct === tx.tokenSell))
    return 'ts';

  if ((addr === tx.taker) && (ct === tx.tokenBuy))
    return 'tb';

  throw new Error('Failed to determine action.');
}

function getCtSignFromTradeTx(addr, ct, tx) {
  const action = getCtActionFromTradeTx(addr, ct, tx);

  if ((action === 'ms') || (action === 'tb'))
    return -1;

  if ((action === 'mb') || (action === 'ts'))
    return 1;

  throw new Error('Failed to determine sign.');
}

function getTokenValueFromBalanceTx(balance) {
  if(balance.depositNumber)
    return Number(balance.amount);

  if(balance.withdrawalNumber)
    return - Number(balance.amount);

  throw new Error('Failed to get token value from balance transaction');
}

function getActionFromBalanceTx(balance) {
  if(balance.depositNumber)
    return 'dp';

  if(balance.withdrawalNumber)
    return 'wd';

  throw new Error('Failed to get token value from balance transaction');
}

async function getRecordsFromSymbol (symbol, addr) {
  if (symbol === 'ETH')
    return await getEthRecords(addr);

  throw new Error (`Failed to get records. Symbol ${symbol} is not recognized.`);
}

module.exports = {
  getTradeHistory,
  getBalanceHistory,
  getCtActionFromTradeTx,
  getCtSignFromTradeTx,
  getTokenValueFromBalanceTx,
  getActionFromBalanceTx
};
