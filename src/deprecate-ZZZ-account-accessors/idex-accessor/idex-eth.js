'use strict';

const assert = require('assert');

const idexProvider = require('./idex-provider');
const idexUtils = require('./idex-utils');
const prices = require('../../../prices-accessor');


async function getEthTradeHistory (addr) {
  return idexProvider.getTradeHistory('ETH_HBT', addr);
}

async function getEthBalanceHistory(addr) {
  const history = await idexProvider.getBalanceHistory(addr);
  const hbtHistory = history.filter(t => t.currency === 'ETH');
  return hbtHistory;
}

function getEthActionFromTradeTx(addr, tx) {
  return idexUtils.getCtActionFromTradeTx(addr, "0x0000000000000000000000000000000000000000", tx);
}

function getEthSignFromTradeTx(addr, tx) {
  return idexUtils.getCtSignFromTradeTx(addr, "0x0000000000000000000000000000000000000000", tx);
}

function getEthValueFromTradeTx(addr, tx) {
  const ethValue = getEthSignFromTradeTx(addr, tx) * Number(tx.total);
  return ethValue;
}

function getEthUsdValueFromTradeTx(addr, tx) {
  const usdValue = getEthSignFromTradeTx(addr, tx) * Number(tx.usdValue);
  return usdValue;
}

async function asEthTradeRecs(addr, txs) {
  const recs = [];

  for (const tx of txs) {
    const rec = {};
    const date = new Date(tx.timestamp * 1000);

    rec.symbol = 'ETH';
    rec.action = getEthActionFromTradeTx(addr, tx);
    rec.date = date;
    rec.isoDate = date.toISOString();
    rec.token = { value: getEthValueFromTradeTx(addr, tx), balance: null };
    rec.usd = { value: getEthUsdValueFromTradeTx(addr, tx), balance: null };
    rec.nok = { value: await prices.getNokFromUsd(date, rec.usd.value), balance: null };

    recs.push(rec);
  }

  return recs;
}

async function asEthBalanceRecs(txs) {
  const recs = [];

  for (const tx of txs) {
    const rec = {};
    const date = new Date(tx.timestamp * 1000);

    rec.symbol = 'ETH';
    rec.action = idexUtils.getActionFromBalanceTx(tx);
    rec.date = date;
    rec.isoDate = date.toISOString();
    rec.token = { value: idexUtils.getTokenValueFromBalanceTx(tx), balance: null };
    rec.usd = { value: await prices.getUsdFrom('ETH', date, rec.token.value), balance: null };
    rec.nok = { value: await prices.getNokFromUsd(date, rec.usd.value), balance: null };

    recs.push(rec);
  }

  return recs;
}

async function getEthRecords(addr) {
  const ethTradeTxs = await getEthTradeHistory(addr);
  const ethBalanceTxs = await getEthBalanceHistory(addr);
  const ethTradeRecs = await asEthTradeRecs(addr, ethTradeTxs);
  const ethBalanceRecs = await asEthBalanceRecs(ethBalanceTxs);

  const ethRecords = ethBalanceRecs.concat(ethTradeRecs);
  const sortedEthRecords = ethRecords.sort((a, b) => a.date.valueOf() - b.date.valueOf());

  let ethBalance = 0;

  for (const rec of sortedEthRecords) {
    ethBalance += rec.token.value;
    rec.token.balance = ethBalance;
    rec.usd.balance = await prices.getUsdFrom('ETH', rec.date, ethBalance);
    rec.nok.balance = await prices.getNokFrom('ETH', rec.date, ethBalance);
  }

  return sortedEthRecords;
}

module.exports = {
  getEthTradeHistory,
  getEthBalanceHistory,
  getEthValueFromTradeTx,
  getEthUsdValueFromTradeTx,
  getEthActionFromTradeTx,
  getEthSignFromTradeTx,
  asEthTradeRecs,
  asEthBalanceRecs,
  getEthRecords
};
