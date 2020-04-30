'use strict';
/*
const superagent = require('superagent');

const config = require('../../../app/config');
const NestedError = require('../../../utils/nested-error');
const TransactionRecordBuilder = require('../../../records').builder;
const provider = require('./etherscan-provider/etherscan-provider');
const prices = require('../../prices');
const currencies = require('../../currencies');

function getSignedValue (symbol, addr, tx) {
  const value = currencies.unitStrToNumber(symbol, tx.value);

  if (tx.to.toLowerCase() === addr.toLowerCase())
    return value;

  if (tx.from.toLowerCase() === addr.toLowerCase())
    return - value;

  throw new Error('Failed to calculate signed value');
}

function getGasFee(tx) {
  const gasPrice = currencies.unitStrToNumber('ETH', tx.gasPrice || '0');
  const gasUsed = Number.parseInt(tx.gasUsed || '0');
  const gasFee = gasPrice * gasUsed;
  return gasFee;
}

function getAction (symbol, addr, tx) {
  const value = getSignedValue(symbol, addr, tx);
  let action = value < 0 ? 's' : 'b';

  if (tx.type && tx.type === 'call')
    action = 'i';

  return action;
}

async function getLatestEthBalance (addr) {
  const balanceStr = await provider.requestLatestEthBalance(addr);
  const balance = currencies.unitStrToNumber('ETH', balanceStr);
  return balance;
}

async function getLatestTokBalance (symbol, addr) {
  const caddr = currencies[symbol].address;
  const balanceStr = await provider.requestLatestTokBalance(caddr, addr);
  const balance = currencies.unitStrToNumber(symbol, balanceStr);
  return balance;
}

async function getRecsFromTxs(symbol, addr, txs) {
  const recs = [];
  let balance = 0;

  for (const tx of txs) {
    const builder = new TransactionRecordBuilder();
    const signedValue = getSignedValue(symbol, addr, tx);
    const gasFee = ((symbol === 'ETH') && (signedValue <0 )) ? getGasFee(tx) : 0;
    const action = getAction(symbol, addr, tx);
    balance += (signedValue - gasFee);

    builder.withExchange('ETHERSCAN');
    builder.withSymbol(symbol);
    builder.withAction(action);
    builder.withDate(new Date(tx.timeStamp * 1000));
    builder.withTokValue(signedValue);
    builder.withTokBalance(balance);
    builder.withUsdTokRate(await prices.getUsdFrom(symbol, builder.date, 1));
    builder.withUsdValue(await prices.getUsdFrom(symbol, builder.date, builder.tokValue));
    builder.withUsdBalance(await prices.getUsdFrom(symbol, builder.date, builder.tokBalance));
    builder.withNokUsdRate(await prices.getNokFrom('USD', builder.date, 1));
    builder.withNokValue(await prices.getNokFrom(symbol, builder.date, builder.tokValue));
    builder.withNokBalance(await prices.getNokFrom(symbol, builder.date, builder.tokBalance));

    recs.push(builder.build());
  }

  return recs;
}

async function getExtRecords (addr) {
  const txs = await provider.requestEthereumTransactions(addr);
  const recs = getRecsFromTxs('ETH', addr, txs);
  return recs;
}

async function getIntRecords (addr) {
  const txs = await provider.requestInternalTransactions(addr);
  const recs = getRecsFromTxs('ETH', addr, txs);
  return recs;
}

async function getEthRecords (addr) {
  const extTxs = await provider.requestEthereumTransactions(addr);
  const intTxs = await provider.requestInternalTransactions(addr);
  const ethTxs = extTxs.concat(intTxs);
  const sortedEthTxs = ethTxs.sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
  const recs = getRecsFromTxs('ETH', addr, sortedEthTxs);
  return recs;
}

async function getTokRecords (symbol, addr) {
  const txs = await provider.requestTokenTransactions(addr);
  const filteredTxs = txs.filter(tx => tx.tokenSymbol === symbol);
  const recs = getRecsFromTxs(symbol, addr, filteredTxs);
  return recs;
}

async function getRecordsFromSymbol(symbol, addr) {
  if (symbol === 'ETH')
    return getEthRecords(addr);
  else
    return getTokRecords(symbol, addr);
}

async function getLatestBalanceFromSymbol(symbol, addr) {
  if (symbol === 'ETH')
    return getLatestEthBalance(addr);
  else
    return getLatestTokBalance(symbol, addr);
}

module.exports = {
  getLatestEthBalance,
  getLatestTokBalance,
  getExtRecords,
  getIntRecords,
  getEthRecords,
  getTokRecords,
  getRecordsFromSymbol,
  getLatestBalanceFromSymbol,
};
*/