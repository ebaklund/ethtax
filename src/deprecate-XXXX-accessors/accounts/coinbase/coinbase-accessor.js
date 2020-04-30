'use strinct';

const superagent = require('superagent');
const crypto = require('crypto');
const NestedError = require('../../../../utils/nested-error');

const _rootUri = new WeakMap();
const _apiKey = new WeakMap();
const _apiSecret = new WeakMap();
const _accounts = new WeakMap();
const _transactions = new WeakMap();
const _addresses = new WeakMap();

async function _getAccounts () {
  let accounts = _accounts.get(this);

  if (!accounts) {
    accounts = new Map();
    (await this.request('accounts')).forEach(acc => accounts.set(acc.id, acc));
    _accounts.set(this, accounts);
  }

  return accounts;
}

class CoinbaseAccessor {
  constructor (apiKey, apiSecret) {
    _rootUri.set(this, 'https://api.coinbase.com/v2/');
    _apiKey.set(this, apiKey);
    _apiSecret.set(this, apiSecret);
    _transactions.set(this, new Map());
    _addresses.set(this, new Map());
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

  async request (query) {
    // Documentation: https://developers.coinbase.com/
    const queryUri = `${this.rootUri}/${query}`;
    const now = 1 + (Date.now()/1000)|0;
    const signature = crypto.createHmac('sha256', this.apiSecret).update(`${now}GET/v2/${query}`).digest('hex');

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

      return res.body.data;
    }
    catch (err) {
      throw new NestedError (err, `Failed to request Coinbase data. queryUrl: ${queryUri}. ` + err.message);
    }
  }

  async getAccount (id) {
    return (await this.getAccounts()).get(id);
  }

  async getTransactions (id) {
    let transactions = _transactions.get(this).get(id);

    if (!transactions) {
      transactions = await this.request(`accounts/${id}/transactions`);
      _transactions.get(this).set(id, transactions);
    }

    return transactions;
  }

  async getAddresses (id) {
    let addresses = _addresses.get(this).get(id);

    if (!addresses) {
      addresses = await this.request(`accounts/${id}/addresses`);
      _addresses.get(this).set(id, addresses);
    }

    return addresses;
  }

  async getAccountInfos () {
    const accounts = _getAccounts.call(this);
  }
}

module.exports = CoinbaseAccessor;
