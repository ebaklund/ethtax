'use strict';

const superagent = require('superagent');
const ethers = require('ethers');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');

const etherscanKey = config.etherscan.apiKey;

async function requestAction(query) {
  const res = await superagent
  .get(query)
  .set('Accept', 'application/json');
  //console.log(res.body.result);
  return res.body.result;
}

async function requestActionTxlist (addr) {
  const query = `http://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanKey}`;
  return requestAction(query);
}

async function requestActionTokentx (addr) {
  const query = `http://api.etherscan.io/api?module=account&action=tokentx&address=${addr}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanKey}`;
  return requestAction(query);
}

function signedValueEth (addr, ethtx) {
  if (ethtx.to.toLowerCase() === addr.toLowerCase())
    return ethtx.value;

  if (ethtx.from.toLowerCase() === addr.toLowerCase())
    return '-' + ethtx.value;

  throw new Error('Failed to calculate signed value');
}

const prices = {
  getInUsd: (symbol, timestamp, value) => { return 0; },
  getInNok: (symbol, timestamp, value) => { return 0; }
}

function getInUsd(symbol, timestamp, value, balance) {
  return {
    value: prices.getInUsd(symbol, timestamp, value),
    balance: prices.getInUsd(symbol, timestamp, balance)
  };
}

function getInNok(symbol, timestamp, value, balance) {
  return {
    value: prices.getInNok(symbol, timestamp, value),
    balance: prices.getInNok(symbol, timestamp, balance)
  };
}

async function getEthRecords (addr) {
  try {
    let acc = ethers.utils.bigNumberify(0);
    const txs = (await requestActionTxlist(addr)).filter(t => !t.tokenSymbol);

    return txs.map(t => {
      const rec = {};
      rec.symbol = 'ETH';
      rec.timeStamp = t.timeStamp;
      rec.isoDate = (new Date(Number(t.timeStamp) * 1000)).toISOString();
      rec.token = {
        value: signedValueEth(addr, t),
        balance: (acc = acc.add(signedValueEth(addr, t)), acc).toString()
      };
      rec.usd = getInUsd(rec.symbol, rec.timeStamp, rec.token.value, rec.token.balance);
      rec.nok = getInNok(rec.symbol, rec.timeStamp, rec.token.value, rec.token.balance);

      return rec;
    });
  }
  catch (err) {
    throw new NestedError(err, 'Failed to get ETH records. ' + err.msg);
  }
}

module.exports = {
  getEthRecords,
  requestActionTokentx
};