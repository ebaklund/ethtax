'use strict';

const idexProvider = require('./idex-provider');
const idexUtils = require('./idex-utils');
const prices = require('../../../prices-accessor');

const hbtAddr = '0xDd6C68bb32462e01705011a4e2Ad1a60740f217F'.toLowerCase();

async function getHbtTradeHistory (addr) {
  return idexProvider.getTradeHistory('ETH_HBT', addr);
}

async function getHbtBalanceHistory(addr) {
  const history = await idexProvider.getBalanceHistory(addr);
  const hbtHistory = history.filter(t => t.currency === 'HBT');
  return hbtHistory;
}

function getHbtActionFromTradeTx(addr, tx) {
  return idexUtils.getCtActionFromTradeTx(addr, hbtAddr, tx);
}

function getHbtSignFromTradeTx(addr, tx) {
  return idexUtils.getCtSignFromTradeTx(addr, hbtAddr, tx);
}

function getHbtFeeFromTradeTx(addr, tx) {
  if (addr.toLowerCase() === tx.maker.toLowerCase())
    if (tx.type === 'buy')
      return Number(tx.buyerFee);
    if (tx.type == 'sell')
      return Number(tx.sellerFee);

  if (addr.toLowerCase() === tx.taker.toLowerCase())
    if (tx.type === 'buy')
      return Number(tx.buyerFee) + Number(tx.gasFee);
    if (tx.type == 'sell')
      return Number(tx.sellerFee);

  throw new Error ('Failed to determine fee of HBT transaction.');
}

function getHbtValueFromTradeTx(addr, tx) {
  const sign = getHbtSignFromTradeTx(addr, tx);
  const fee = getHbtFeeFromTradeTx(addr, tx);
  const ethValue = sign * (Number(tx.amount) - fee); // Amount for token, total for eth
  return ethValue;
}

function getHbtUsdValueFromTradeTx(addr, tx) {
  const usdValue = getHbtSignFromTradeTx(addr, tx) * Number(tx.usdValue);
  return usdValue;
}

async function asHbtTradeRecs(addr, txs) {
  const recs = [];

  for (const tx of txs) {
    const rec = {};
    const date = new Date(tx.timestamp * 1000);

    rec.symbol = 'HBT';
    rec.action = getHbtActionFromTradeTx(addr, tx);
    rec.date = date;
    rec.isoDate = date.toISOString();
    rec.token = { value: getHbtValueFromTradeTx(addr, tx), balance: null };
    rec.usd = { value: getHbtUsdValueFromTradeTx(addr, tx), balance: null };
    rec.nok = { value: await prices.getNokFromUsd(date, rec.usd.value), balance: null };

    recs.push(rec);
  }

  return recs;
}

async function asHbtBalanceRecs(txs) {
  const recs = [];

  for (const tx of txs) {
    const rec = {};
    const date = new Date(tx.timestamp * 1000);

    rec.symbol = 'HBT';
    rec.action = idexUtils.getActionFromBalanceTx(tx);
    rec.date = date;
    rec.isoDate = date.toISOString();
    rec.token = { value: idexUtils.getTokenValueFromBalanceTx(tx), balance: null };
    rec.usd = { value: await prices.getUsdFrom('HBT', date, rec.token.value), balance: null };
    rec.nok = { value: await prices.getNokFromUsd(date, rec.usd.value), balance: null };

    recs.push(rec);
  }

  return recs;
}

async function getHbtRecords(addr) {
  const hbtTradeTxs = await getHbtTradeHistory(addr);
  const hbtBalanceTxs = await getHbtBalanceHistory(addr);
  const hbtTradeRecs = await asHbtTradeRecs(addr, hbtTradeTxs);
  const hbtBalanceRecs = await asHbtBalanceRecs(hbtBalanceTxs);

  const hbtRecords = hbtBalanceRecs.concat(hbtTradeRecs);
  const sortedHbtRecords = hbtRecords.sort((a, b) => a.date.valueOf() - b.date.valueOf());

  let hbtBalance = 0;

  for (const rec of sortedHbtRecords) {
    hbtBalance += rec.token.value;
    rec.token.balance = hbtBalance;
    rec.usd.balance = await prices.getUsdFrom('HBT', rec.date, hbtBalance);
    rec.nok.balance = await prices.getNokFrom('HBT', rec.date, hbtBalance);
  }

  return sortedHbtRecords;
}

module.exports = {
  getHbtTradeHistory,
  getHbtBalanceHistory,
  getHbtValueFromTradeTx,
  getHbtUsdValueFromTradeTx,
  getHbtActionFromTradeTx,
  getHbtSignFromTradeTx,
  asHbtTradeRecs,
  asHbtBalanceRecs,
  getHbtRecords
};
