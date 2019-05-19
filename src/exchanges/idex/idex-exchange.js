'use strict';

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

const superagent = require('superagent');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');
const prices = require('../../prices');

async function getPagedRequest(url, payload) {
  let result = [];
  let idex_next_cursor = null;

  while (idex_next_cursor !== undefined) {
    if (idex_next_cursor)
      payload['cursor'] = idex_next_cursor;

    const res = await superagent
    .post(url)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(payload));

    const values = Object.values(res.body);
    for (const arr of Object.values(res.body))
      result = result.concat(arr);

    idex_next_cursor = res.headers['idex-next-cursor'];
  }

  return result;
}

async function getTradeHistory(market, addr) {
  const payload = {
   market: market,
    address: addr,
    sort: "asc",
    count: 100
  };

  return getPagedRequest('https://api.idex.market/returnTradeHistory', payload);
}

function getDepositHistory(addr) {
    const payload = {
      address: addr,
      sort: "asc",
      count: 100
    };

  return getPagedRequest('https://api.idex.market/returnDepositsWithdrawals', payload);
}

function getEthTradeHistory(addr) {
  return getTradeHistory("ETH_HBT", addr);
}

async function getEthDepositHistory(addr) {
  const history = await getDepositHistory(addr);
  const hbtHistory = history.filter(t => t.currency === 'ETH');
  return hbtHistory;
}

function getHbtTradeHistory(addr) {
  return getTradeHistory("ETH_HBT", addr);
}

async function getHbtDepositHistory(addr) {
  const history = await getDepositHistory(addr);
  const hbtHistory = history.filter(t => t.currency === 'HBT');
  return hbtHistory;
}

function getTokenValue(tx) {
  if (/^0x0{40}/.test(tx.tokenSell))
    return '-' + tx.total;

  if (/^0x0{40}/.test(tx.tokenBuy))
    return tx.total;

  throw new Error('Failed to get token value');
}

function getUsdValue(tx) {
  if (/^0x0{40}/.test(tx.tokenSell))
    return '-' + tx.usdValue;

  if (/^0x0{40}/.test(tx.tokenBuy))
    return tx.usdValue;

  throw new Error('Failed to get usd value');
}

function getNokFromUsd(usd) {
  return 0;
}

async function asEthTradeRecs(txs) {
  const recs = [];

  for (const tx of txs) {
    const rec = {};
    const date = new Date(tx.timestamp * 1000);

    rec.symbol = 'ETH';
    rec.timeStampSec = tx.timestamp;
    rec.isoDate = date.toISOString();
    rec.token = { value: getTokenValue(tx), balance: null };
    rec.usd = { value: getUsdValue(tx), balance: null };
    rec.nok = { value: await prices.getNokFromUsd(date, rec.usd.value), balance: null };

    recs.push(rec);
  }

  return recs;
}

async function getEthRecords(addr) {
  const ethTradeTxs = await getEthTradeHistory(addr);
  const ethDepositsTxs = await getEthDepositHistory(addr);
  const ethTradeRecs = await asEthTradeRecs(ethTradeTxs);
  const ethDepositsRecs = asEthDepositRecs(ethDepositsTxs);
}

module.exports = {
  getTradeHistory,
  getDepositHistory,
  getEthTradeHistory,
  getEthDepositHistory,
  getHbtTradeHistory,
  getHbtDepositHistory,
  getEthRecords
};
