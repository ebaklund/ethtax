'use strict';

// Documentation: https://github.com/coinbase/coinbase-node
//                https://developers.coinbase.com/api/v2?javascript
//                https://developers.coinbase.com/api/v2#list-transactions
// Example: GET https://api.coinbase.com/v2/accounts/:account_id/transactions
// NOTE: Api key will disabled for 48 hours after creation for security purposes.

const coinbase = require('coinbase');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');

function requestTransactions () {
  const client = new coinbase.Client({'apiKey': config.coinbase.apiKey, 'apiSecret': config.coinbase.apiSecret});

  client.getAccounts({}, function(err, accounts) {
    accounts.forEach(function(acct) {
      console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
    });
  });
}

/*
async function requestTransactions(account) {

  client.getAccount('2bbf394c-193b-5b2a-9155-3b4732659ede', function(err, account) {
    account.getTransactions(function(err, txs) {
      console.log(txs);
    });
  });
}
*/

module.exports = {
  requestTransactions
};
