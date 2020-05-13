'use strict';

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

require('../../../../runtime-types/address-string');
const t = require('flow-runtime');
const assert = require('assert');
const superagent = require('superagent');

const NestedError = require('../../../../utils/nested-error');

async function getPagedRequest(query, payload) {
  const rootUri = 'https://api.idex.market';
  const fullQuery = `${rootUri}/${query}`;
  const pages = [];
  let idex_next_cursor = null;


  while (idex_next_cursor !== undefined) {
    if (idex_next_cursor)
      payload['cursor'] = idex_next_cursor;

    const payloadStr = JSON.stringify(payload);
    console.log(`*** QUERY: ${fullQuery} ${payloadStr}`);

    try {
      const res = await superagent
      .post(fullQuery)
      .set('Content-Type', 'application/json')
      .send(payloadStr);

      if (res.status !== 200)
        throw Error(`HTTP failure ${res.status}`);

      const hasData =
        (res.body instanceof Array && res.body.length > 0) ||
        (Object.entries(res.body).length > 0);

      if (hasData)
        pages.push(res.body);

      idex_next_cursor = res.headers['idex-next-cursor'];
    }
    catch (err) {
      throw new NestedError(err, 'Failed to do paged request from idex. ' + err.message);
    }
  }

  return pages;
}

async function getBalances(wallet) {
  const payload = { address: wallet, sort: "asc", count: 100 };
  const pages = await getPagedRequest('returnBalances', payload);

  const balances = pages.reduce((obj, page) => (Object.assign(obj, page), obj), {});

  return balances;
}

async function getDepositsWithdrawals(wallet) {
  t.AddressString().assert(wallet);

  const payload = { address: wallet, sort: "asc", count: 100 };
  const pages = await getPagedRequest('returnDepositsWithdrawals', payload);

  const depositsWithdrawals = pages.reduce((obj, page) => {
    obj.deposits.push(...page.deposits);
    obj.withdrawals.push(...page.withdrawals);
    return obj;
  }, {deposits:[], withdrawals: []});

  return depositsWithdrawals;
}


async function getTradeHistory(wallet) {
  t.AddressString().assert(wallet);

  const payload = { address: wallet, sort: "asc",  count: 100 };
  const pages = await getPagedRequest('returnTradeHistory', payload);

  const transactions = pages.reduce((arr, page) => arr.concat(page), []);

  return transactions;
}

module.exports = {
  getBalances,
  getDepositsWithdrawals,
  getTradeHistory
};
