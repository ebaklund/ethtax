'use strict';

// Documentation: https://etherscan.io/apis#accounts

const superagent = require('superagent');
const ethers = require('ethers');

const config = require('../../../../../app/config');
const NestedError = require('../../../../../utils/nested-error');
const TransactionRecordBuilder = require('../../../../../records').builder;

const etherscanKey = config.etherscan.apiKey;

async function requestAction(query) {
  try {
    const res = await superagent
    .get(query)
    .set('Accept', 'application/json');
    //console.log(res.body.result);
    return res.body.result;
  }
  catch (err) {
    throw new NestedError (err, 'Failed to request Etherscan data. ' + err.message);
  }
}

const _latestEthBalances = {};

async function requestLatestEthBalance (addr) {
  addr = addr.toLowerCase();

  if (!_latestEthBalances[addr]) {
    const query = `https://api.etherscan.io/api?module=account&action=balance&address=${addr}&tag=latest&apikey=${etherscanKey}`;
    _latestEthBalances[addr] = await requestAction(query);
  }

  return _latestEthBalances[addr];
}

const _latestTokBalances = {};

async function requestLatestTokBalance (caddr, addr) {
  caddr = caddr.toLowerCase();
  addr = addr.toLowerCase();

  if (!_latestTokBalances[addr]) {
    const query = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${caddr}&address=${addr}&tag=latest&apikey=${etherscanKey}`;
    _latestTokBalances[addr] = await requestAction(query);
  }

  return _latestTokBalances[addr];
}

const _ethereumTransactions = {};

async function requestEthereumTransactions (addr) {
  addr = addr.toLowerCase();

  if (!_ethereumTransactions[addr]) {
    const query = `http://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanKey}`;
    _ethereumTransactions[addr] = await requestAction(query);
  }

  return _ethereumTransactions[addr];
}

const _tokenTransactions = {};

async function requestTokenTransactions (addr) {
  addr = addr.toLowerCase();

  if (!_tokenTransactions[addr]) {
    const query = `http://api.etherscan.io/api?module=account&action=tokentx&address=${addr}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanKey}`;
    _tokenTransactions[addr] = await requestAction(query);
  }

  return _tokenTransactions[addr];
}

const _internalTransactions = {};

async function requestInternalTransactions (addr) {
  addr = addr.toLowerCase();

  if (!_internalTransactions[addr]) {
    const query = `http://api.etherscan.io/api?module=account&action=txlistinternal&address=${addr}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanKey}`;
    _internalTransactions[addr] = await requestAction(query);
  }

  return _internalTransactions[addr];
}

module.exports = {
  requestLatestEthBalance,
  requestLatestTokBalance,
  requestEthereumTransactions,
  requestTokenTransactions,
  requestInternalTransactions
};