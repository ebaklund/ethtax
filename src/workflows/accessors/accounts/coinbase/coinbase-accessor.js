'use strict';

require('../primitives/accessor-account-info');
require('../primitives/accessor-transaction-info');
const t = require('flow-runtime');

const NestedError = require('../../../../utils/nested-error');

const superagent = require('superagent');
const crypto = require('crypto');
const AsyncChain = require('@hubiinetwork/async-chain');

// Private

const _rootUri = new WeakMap();
const _apiKey = new WeakMap();
const _apiSecret = new WeakMap();

async function request (query) {
  // Documentation: https://developers.coinbase.com/
  const queryUri = `${this.rootUri}/${query}`;
  const now = 1 + (Date.now()/1000)|0;
  const signature = crypto.createHmac('sha256', this.apiSecret).update(`${now}GET/v2/${query}`).digest('hex');

  console.log(`*** QUERY ${queryUri}`);
  // console.log('*** TODO: Add pagination to coinbase-agent');

  try {
    const res = await superagent
      .get(queryUri)
      .set('Accept', 'application/json')
      .set('CB-ACCESS-KEY', this.apiKey)
      .set('CB-ACCESS-SIGN', signature)
      .set('CB-ACCESS-TIMESTAMP', now)
      .set('CB-VERSION', '2018-06-15')
      .set('strictSSL', false);

    if (res.body.warnings && res.body.warnings.length > 0)
      throw new Error(`Found warning in response. ${JSON.stringify(res.body.warnings)}`);

    if (res.body.pagination.next_uri !== null) {
      // TODO: https://developers.coinbase.com/api/v2#pagination
      throw Error('Failed to complete query. Pagination is required.');
    }

    return res.body.data;
  }
  catch (err) {
    throw new NestedError (err, `Failed to request Coinbase data. queryUrl: ${queryUri}. ` + err.message);
  }
}

async function getTransactions (accountId) {
  const txs = (await request.call(this, `accounts/${accountId}/transactions`));
  return txs;
}

async function getAddress (accountId) {
  const addresses = (await request.call(this, `accounts/${accountId}/addresses`));

  if (addresses.length > 1)
    throw new Error(`Expected address count to be at most 1. Is ${addresses.length}`);

  return (addresses.length === 0)
    ? null
    : addresses[0].address.toLowerCase();
}

function extractInfoFromAccount (account) {
  const accountInfo = {
    id: account.id,
    exchange: 'Coinbase',
    name: account.name,
    type: account.type,
    tokBalance: Number.parseFloat(account.balance.amount),
    tokSymbol: account.balance.currency
  };

  return accountInfo;
}

function extractInfoFromTransaction (accountId, tx) {
  if ((tx.type === 'transfer') && (tx.status !== 'completed'))
    throw new Error('Failed to parse transaction. Unexpected status or type.');

  const txInfo = {
    tokSymbol: tx.amount.currency,
    tokAmount: Number.parseFloat(tx.amount.amount),
    date: new Date(tx.created_at),
    fee: 0,
    misc: Object.assign({ type: tx.type }, tx.details)
  };

  t.AccessorTransactionInfo().assert(txInfo);

  return txInfo;
}

async function getTransactionInfos (accountId) {
  return (await getTransactions.call(this, accountId))
    .map(tx => {
      if (tx.status !== 'completed')
        throw Error('Expected transaction to be completed');

      return tx;
    })
    .map(tx => extractInfoFromTransaction(accountId, tx))
    .sort((a, b) => {
      const res = a.date.valueOf() - b.date.valueOf(); // Ascending date

      // Has the annoying feature that pass-through transactions have the same timestamp.
      // Ensure receive first then send next.
      if (res === 0) {
        if (a.tokAmount !== -b.tokAmount)
          throw Error('Failed to sort transaction pair. Expected transition transaction.');

        res = b.tokAmount; // Deposit first. Will be a if b.tokAmount is positive.
      }

      return res;
    });
}

// Public

class CoinbaseAccessor {
  constructor (apiKey, apiSecret) {
    _rootUri.set(this, 'https://api.coinbase.com/v2/');
    _apiKey.set(this, apiKey);
    _apiSecret.set(this, apiSecret);
  }

  get rootUri () {
    return _rootUri.get(this);
  }

  get apiKey () {
    return _apiKey.get(this);
  }

  get apiSecret () {
    return _apiSecret.get(this);
  }

  async getAccountInfos () {
    return AsyncChain.from(await request.call(this, 'accounts'))
      .map(account => {
        return [ account, extractInfoFromAccount (account) ];
      })
      .map(async ([account, info]) => {
        info.transactions = await getTransactionInfos.call(this, info.id);
        return [account, info];
      })
      .filter(([account, info]) => {
        return info.transactions.length > 0;
      })
      .map(async ([account, info]) => {
        info.address = await getAddress.call(this, info.id);

        if (info.address === null)
          info.address = 'Type ' + account.type;

        return [account, info];
      })
      .forEach(([account, info]) => {
        t.AccessorAccountInfo().assert(info);
      })
      .reduce((arr, [account, info]) => {
        return (arr.push(info), arr);
      }, []);
  }
}

module.exports = CoinbaseAccessor;
