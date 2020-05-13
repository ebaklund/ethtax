'use strict';

require('../primitives/accessor-account-info');
require('../primitives/accessor-transaction-info');
const t = require('flow-runtime');

const AddressString = require('../../../../runtime-types/address-string');

const idexProvider = require('./idex-provider');
const NestedError = require('../../../../utils/nested-error');
const currencies = require('../../currencies');

const AsyncChain = require('@hubiinetwork/async-chain');
const superagent = require('superagent');
const assert = require('assert');

// Private

const _apiKey = new WeakMap();
const _addresses = new WeakMap();

function getUniqueTokSymbols (dwTxs) {
  const symbolSet = dwTxs.deposits.concat(dwTxs.withdrawals)
    .reduce((set, dw) => (set.add(dw.currency), set), new Set());

  return [...symbolSet.values()];
}

function haveSameSymbols (balances, tokSymbols) {
  const haveSame =
    ([...Object.keys(balances)].length === tokSymbols.length) &&
    tokSymbols.every(sym => balances[sym] !== undefined);

  return haveSame;
}

function generateMarketSymbols (sym1, symbols) {
  const marketSymbols = symbols.reduce((arr, sym2) =>
    (sym1 === sym2)
      ? arr
      : (arr.push(`${sym1}_${sym2}`), arr)
  , []);

  return marketSymbols;
}

async function extractTransactionInfoFromDW(wallet, depositsWithdrawal, sign) {
  t.AddressString().assert(wallet);
  t.object().assert(depositsWithdrawal);
  t.number().assert(sign);

  const dw = depositsWithdrawal;

  const info = {
    action: (sign < 0) ? 'wit' : 'dep',
    date: new Date(dw.timestamp * 1000),
    tokSymbol: dw.currency,
    tokAmount: sign * dw.amount,
    fee: 0,
    misc: dw
  };

  t.AccessorTransactionInfo().assert(info);

  return info;
}

function arrEq (arr1, arr2) {
  return (arr1.length !== arr2.length) && [...arr1.keys()].every(i => arr1[i] === arr2[i]);
}

const eth = "0x0000000000000000000000000000000000000000";

function extractEthTransactionInfoFromTrade (wallet, tradeTx) {
  t.AddressString().assert(wallet);
  t.object().assert(tradeTx);
  t.AddressString().assert(tradeTx.maker);
  t.AddressString().assert(tradeTx.taker);
  t.AddressString().assert(tradeTx.tokenBuy);
  t.AddressString().assert(tradeTx.tokenSell);
  assert(tradeTx.type === 'buy' || tradeTx.type === 'sell');

  const roleSign = tradeTx.maker === wallet ? 1 : -1;
  const tradeSign = (tradeTx.tokenBuy === eth) ? 1 : -1;
  const sign = roleSign * tradeSign;

  const gasFee = (tradeTx.taker === wallet)
    ? Number.parseFloat(tradeTx.gasFee)
    : 0;

  const info = {
    action: sign,
    date: new Date(tradeTx.timestamp * 1000),
    tokSymbol: 'ETH',
    tokAmount: sign * Number.parseFloat(tradeTx.total),
    fee: 0, // IDEX does not calculate fees in terms of ETH, but in TOK
    misc: tradeTx
  };

  t.AccessorTransactionInfo().assert(info);

  return info;
}

function extractTokTransactionInfoFromTrade (tokSymbol, wallet, tradeTx) {
  t.string().assert(tokSymbol);
  t.AddressString().assert(wallet);
  t.object().assert(tradeTx);
  t.AddressString().assert(tradeTx.maker);
  t.AddressString().assert(tradeTx.taker);
  t.AddressString().assert(tradeTx.tokenBuy);
  t.AddressString().assert(tradeTx.tokenSell);
  assert(tradeTx.type === 'buy' || tradeTx.type === 'sell');

  const signMaker = tradeTx.maker === wallet ? 1 : -1;
  const signType = tradeTx.type === 'buy' ? 1 : -1;
  const signTok = tradeTx.tokenBuy !== eth ? 1 : -1;

  const sign = signMaker * signType * signTok;

  const txFee = sign > 0 ? tradeTx.buyerFee : tradeTx.sellerFee;
  const gasFee = tradeTx.taker === wallet ? tradeTx.gasFee : '0';

  const info = {
    date: new Date(tradeTx.timestamp * 1000),
    tokSymbol: tokSymbol,
    tokAmount: sign * Number.parseFloat(tradeTx.amount),
    fee: Number.parseFloat(txFee) + Number.parseFloat(gasFee),
    misc: tradeTx
  };

  t.AccessorTransactionInfo().assert(info);

  return info;
}

function extractTransactionInfoPairFromTrade (wallet, tradeTx) {
  t.AddressString().assert(wallet);
  t.object().assert(tradeTx);
  assert(tradeTx.market.split('_')[0] === 'ETH', 'Expected ETH to always be the payment currency');

  const tokSymbol = tradeTx.market.split('_')[1];

  const infos = [
    extractEthTransactionInfoFromTrade(wallet, tradeTx),
    extractTokTransactionInfoFromTrade(tokSymbol, wallet, tradeTx)
  ];

  return infos;
}

function getTradeTransactions (tradeHist) {
  return tradeHist // Array
    .map(marketHist => [...Object.entries(marketHist)][0]) // Object with single market (entry)
    .map(([market, marketTxs]) => marketTxs.map(marketTx => (marketTx.market = market, marketTx))) // Label transactions
    .reduce((tradeTxs, marketTxs) => tradeTxs.concat(marketTxs), []); // Flatten
}

function getTxInfoMap (assortedTxInfos) {
  return assortedTxInfos.reduce((map, txInfo) => {
    if (!map.has(txInfo.tokSymbol))
      map.set(txInfo.tokSymbol, []);

    return (map.get(txInfo.tokSymbol).push(txInfo), map);
  }, new Map())
}

function  extractAccountInfo(tokSymbol, wallet, txsInfos, balanceStr) {
  t.string().assert(tokSymbol);
  t.AddressString().assert(wallet);
  t.array(t.AccessorTransactionInfo()).assert(txsInfos);
  t.string().assert(balanceStr);

  const info = {
    exchange: 'IDEX',
    type: 'wallet',
    wallet: wallet,
    tokSymbol: tokSymbol,
    tokBalance: Number.parseFloat(balanceStr),
    transactions: txsInfos.sort((a, b) => a.date.valueOf() - b.date.valueOf())
  };

  t.AccessorAccountInfo().assert(info);

  return info;
}

async function getAccountInfosFromAddress (wallet) {
  const balances = await idexProvider.getBalances(wallet);
  const dwTxs = await idexProvider.getDepositsWithdrawals(wallet);
  const tradeHist = await idexProvider.getTradeHistory(wallet);
  const tradeTxs = getTradeTransactions(tradeHist);

  const depositTxInfos = await Promise.all(dwTxs.deposits.map(dwTx =>
    extractTransactionInfoFromDW(wallet, dwTx, 1)
  ));

  const withdrawTxInfos = await Promise.all(dwTxs.withdrawals.map(dwTx =>
    extractTransactionInfoFromDW(wallet, dwTx, -1)
  ));

  const tradeTxInfos = await Promise.all(tradeTxs.map(tradeTx =>
    extractTransactionInfoPairFromTrade(wallet, tradeTx)
  ).reduce((infoArr, infoPair) => infoArr.concat(infoPair), []));

  const txsInfoMap = getTxInfoMap([...depositTxInfos, ...withdrawTxInfos, ...tradeTxInfos]);

  const infos = [...txsInfoMap.entries()].map(([tokSymbol, txsInfos]) =>
    extractAccountInfo(tokSymbol, wallet, txsInfos, balances[tokSymbol] || '0')
  );

  return infos;
}

// Public

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

class IdexAccessor {
  constructor (apiKey, addresses) {
    assert(t.string().accepts(apiKey));
    assert(t.array(t.AddressString()).accepts(addresses));

    _apiKey.set(this, apiKey);
    _addresses.set(this, addresses);
  }

  get apiKey () {
    return _apiKey.get(this);
  }

  get addresses () {
    return _addresses.get(this);
  }

  async getAccountInfos () {
    const infos = await AsyncChain.from(this.addresses)
      .map(async wallet => getAccountInfosFromAddress.call(this, wallet))
      .flat()
      .reduce((arr, info) => (arr.push(info), arr), []);

    return infos;
  }
}

module.exports = IdexAccessor;
