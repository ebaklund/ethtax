'use strict';

require('../primitives/accessor-account-info');
require('../primitives/accessor-transaction-info');

require('../../../../runtime-types/ethereum-address');
const t = require('flow-runtime');

const NestedError = require('../../../../utils/nested-error');
const currencies = require('../../currencies');

const superagent = require('superagent');
const AsyncChain = require('@hubiinetwork/async-chain');

// Private

const _rootUri = new WeakMap();
const _apiKey = new WeakMap();
const _addresses = new WeakMap();

let _waitForQuotaTimestamp = 0;

async function waitForQuota () {
  const quotaRate = 200; // 5 requests per sec (https://etherscan.io/apis)
  const delay = Math.max(0, quotaRate - (Date.now() - _waitForQuotaTimestamp));

  await new Promise(resolve => setTimeout(resolve, delay));

  _waitForQuotaTimestamp = Date.now();
}

async function request(query) {
  t.string().assert(query);

  await waitForQuota();

  const fullQuery = `${this.rootUri}/${query}&apikey=${this.apiKey}`;

  console.log(`*** QUERY: ${fullQuery}`);

  try {
    const res = await superagent
    .get(fullQuery)
    .set('Accept', 'application/json');

    if (res.status === 200)
      return res.body.result;

    throw new Error(`Status ${res.status}: ${res.text}`);
  }
  catch (err) {
    throw new NestedError (err, 'Failed to request Etherscan data. ' + err.message);
  }
}

async function getEthBalance (wallet) {
  t.EthereumAddress().assert(wallet);

  const query = `?module=account&action=balance&address=${wallet}&tag=latest`;
  const balance = await request.call(this, query);

  return balance;
}

async function getTokBalance (wallet, contract) {
  t.EthereumAddress().assert(wallet);
  t.EthereumAddress().assert(contract);

  const query = `?module=account&action=tokenbalance&contractaddress=${contract}&address=${wallet}&tag=latest`;
  const balance = await request.call(this, query);

  return balance;
}

async function getEthTransactions (wallet) {
  t.EthereumAddress().assert(wallet);

  const query = `?module=account&action=txlist&address=${wallet}&startblock=0&endblock=99999999&sort=asc`;
  const externalTransactions = await request.call(this, query);

  const intQuery = `?module=account&action=txlistinternal&address=${wallet}&startblock=0&endblock=999999999&sort=asc`;
  const internalTransactions = await request.call(this, intQuery);

  const  transactions = externalTransactions.concat(internalTransactions);

  return transactions;
}

async function getTokTransactions (wallet) {
  t.EthereumAddress().assert(wallet);

  const extQuery = `?module=account&action=tokentx&address=${wallet}&startblock=0&endblock=999999999&sort=asc`;
  const transactions = await request.call(this, extQuery);

  return transactions;
}

/*
async function getBlock (blockNumber) {
  t.DefinitePosInteger().assert(blockNumber);

  const tag = blockNumber.toString(16);
  const expandTxs = false;
  const query = `?module=proxy&action=eth_getBlockByNumber&tag=${tag}=${expandTxs}`;
  const block = await request.call(this, query);

  return block;
}
*/

function getSignedValue (symbol, wallet, tx) {
  const value = currencies.unitStrToNumber(symbol, tx.value);

  if (tx.to.toLowerCase() === wallet.toLowerCase())
    return value;

  if (tx.from.toLowerCase() === wallet.toLowerCase())
    return - value;

  throw new Error('Failed to calculate signed value');
}

function getGasFee(signedValue, tx) {
  return (signedValue <0)
    ? currencies.unitStrToNumber('ETH', tx.gasPrice) * Number.parseInt(tx.gasUsed)
    : 0;
}

async function extractEthTransactionInfo(wallet, tx) {
  t.EthereumAddress().assert(wallet);
  t.object().assert(tx);

  const signedValue = getSignedValue ('ETH', wallet, tx);

  const info = {
    date: new Date(tx.timeStamp * 1000),
    tokSymbol: 'ETH',
    tokAmount: signedValue,
    fee: getGasFee(signedValue, tx),
    misc: tx
  };

  t.AccessorTransactionInfo().assert(info);

  return info;
}

async function extractEthAccountInfo(wallet, txs, balance) {
  t.EthereumAddress().assert(wallet);
  t.array().assert(txs);
  t.string().assert(balance);

  const info = {
    exchange: 'Etherscan',
    type: 'wallet',
    address: wallet,
    tokSymbol: 'ETH',
    tokBalance: currencies.unitStrToNumber('ETH', balance),
    transactions: await Promise.all(txs.map(tx => extractEthTransactionInfo(wallet, tx)))
  };

  info.transactions.sort((a, b) => a.date.valueOf() - b.date.valueOf());

  t.AccessorAccountInfo().assert(info);

  return info;
}

async function extractTokTransactionInfo(symbol, wallet, tx) {
  t.string().assert(symbol);
  t.EthereumAddress().assert(wallet);
  t.object().assert(tx);

  const info = {
    date: new Date(tx.timeStamp * 1000),
    tokSymbol: symbol,
    tokAmount: getSignedValue (symbol, wallet, tx),
    fee: 0,
    misc: tx
  };

  t.AccessorTransactionInfo().assert(info);

  return info;
}

async function extractTokAccountInfo(symbol, wallet, txs, balanceStr) {
  t.string().assert(symbol);
  t.EthereumAddress().assert(wallet);
  t.array().assert(txs);
  t.string().assert(balanceStr);

  const transactions = await Promise.all(txs.map(tx => extractTokTransactionInfo(symbol, wallet, tx)));

  const info = {
    exchange: 'Etherscan',
    type: 'wallet',
    address: wallet,
    tokSymbol: symbol,
    tokBalance: currencies.unitStrToNumber(symbol, balanceStr),
    transactions: transactions
  };

  t.AccessorAccountInfo().assert(info);

  return info;
}

const symbolBlackist = new Set([
  'blockwell.ai KYC Casper Token', // https://medium.com/imtoken/regarding-blockwell-ai-kyc-casper-token-transaction-notifications-aac3c81b9863
]);

async function getTokTransactionsMap (wallet) {
  const tokTxs = (await getTokTransactions.call(this, wallet))
    .filter(tx => !symbolBlackist.has(tx.tokenSymbol));

  const tokTransactionMap = tokTxs.reduce((map, tx) => {
    if (!map.has(tx.contractAddress))
      map.set(tx.contractAddress, { symbol: tx.tokenSymbol, transactions: [] });

    map.get(tx.contractAddress).transactions.push(tx);

    return map;
  }, new Map());

  return tokTransactionMap;
}

async function getTokBalanceMap (wallet, contracts) {
  t.EthereumAddress().assert(wallet);

  if (!t.array(t.EthereumAddress()).accepts(contracts))
    throw new TypeError('Expected [...EthereumAddress].');

  const tokBalanceMap = await AsyncChain.from(contracts)
    .reduce(async (map, contract) => {
      const balance = await getTokBalance.call(this, wallet, contract);

      return (map.set(contract, balance), map);
    }, new Map());

  return tokBalanceMap;
}

async function getTokAccountInfos (wallet, tokTxsMap, tokBalanceMap) {
  t.EthereumAddress().assert(wallet);
  t.class(Map).assert(tokTxsMap);
  t.class(Map).assert(tokBalanceMap);

  const tokAccountInfos = await AsyncChain.from(tokTxsMap.entries())
    .map(async ([contract, {symbol, transactions}]) => {
      return extractTokAccountInfo(symbol, wallet, transactions, tokBalanceMap.get(contract));
    })
    .reduce((arr, info) => (arr.push(info), arr), []);

  return tokAccountInfos;
}

async function getAccountInfosFromAddress (wallet) {
  t.EthereumAddress().assert(wallet);

  const ethTxs = (await getEthTransactions.call(this, wallet));
  const ethBalance = await getEthBalance.call(this, wallet);
  const ethAccountInfo = await extractEthAccountInfo(wallet, ethTxs, ethBalance);

  const tokTxsMap = await getTokTransactionsMap.call(this, wallet);
  const tokBalanceMap = await getTokBalanceMap.call(this, wallet, [...tokTxsMap.keys()]);
  const tokAccountInfos = await getTokAccountInfos.call(this, wallet, tokTxsMap, tokBalanceMap);

  return [ethAccountInfo].concat(tokAccountInfos);
}

// Public

class EtherscanAccessor {
  constructor (apiKey, addresses) {
    t.string().assert(apiKey);
    t.array(t.EthereumAddress()).assert(addresses);

    _rootUri.set(this, 'https://api.etherscan.io/api');
    _apiKey.set(this, apiKey);
    _addresses.set(this, addresses);
  }

  get rootUri () {
    return _rootUri.get(this);
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

module.exports = EtherscanAccessor;
