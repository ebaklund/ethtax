'use strict';

require('../../accessors/accounts/primitives/accessor-account-info');
require('../primitives/output-transactions-header');
require('../primitives/output-transaction-record');
require('../primitives/output-year-balance');
require('../primitives/output-transaction-table');
const t = require('flow-runtime');

const prices = require('../../accessors/prices');
const currencies = require('../../accessors/currencies');

const assert = require('assert');
const ethers = require('ethers');

// Private

function getTransactionsHeader (accountInfo) {
  t.AccessorAccountInfo().assert(accountInfo);

  const header = {
    exchange: accountInfo.exchange,
    symbol: accountInfo.tokSymbol,
    wallet: accountInfo.wallet
  }

  t.OutputTransactionsHeader().assert(header);

  return header;
}

async function getTransactionRecords (accountInfo) {
  t.AccessorAccountInfo().assert(accountInfo);

  const records = [];
  let runningTokBalance = 0;
  let runningDate = new Date(0);
  let runningAmount = null;

  const isAscendingTime = (tx) => {
    if (tx.date.valueOf() < runningDate.valueOf())
      return false;
/*
    if (tx.date.valueOf() === runningDate.valueOf()) {
      const isTransitionPair = tx.amount === -runningAmount;

      if (! isTransitionPair)
        return false;
    }

    runningAmount = tx.amount;
*/
    runningDate = tx.date;

    return true;
  };

  for (const tx of accountInfo.transactions) {
    assert(isAscendingTime(tx));
    assert(accountInfo.tokSymbol === tx.tokSymbol);

    const date = tx.date;
    const tokSymbol = accountInfo.tokSymbol;
    const tokAmount = tx.tokAmount;

    runningTokBalance += (tokAmount - tx.fee);

    // UGLY
    if ((runningTokBalance < 0) && (runningTokBalance > -0.000000000001))
      runningTokBalance = 0;

    t.DefiniteNumber().assert(tokAmount);

    if (!t.DefinitePosNumber().accepts(runningTokBalance))
      throw Error(`Balance is running negative! wallet: ${accountInfo.wallet}`);

    const transactionRec = {
      date: date,
      tokSymbol: tokSymbol,
      tokAmount: tokAmount,
      fee: tx.fee,
      tokBalance: runningTokBalance,
      usdTokRate: await prices.getUsdFrom(tokSymbol, date, 1),
      usdAmount: await prices.getUsdFrom(tokSymbol, date, tokAmount),
      usdBalance: await prices.getUsdFrom(tokSymbol, date, runningTokBalance),
      nokUsdRate: await prices.getNokFrom('USD', date, 1),
      nokAmount: await prices.getNokFrom(tokSymbol, date, tokAmount),
      nokBalance: await prices.getNokFrom(tokSymbol, date, runningTokBalance),
    };

    t.OutputTransactionRecord().assert(transactionRec);

    records.push(transactionRec);
  }

  if (runningTokBalance.toFixed(12) !== accountInfo.tokBalance.toFixed(12))
    throw new Error(`Failed to ensure that ${accountInfo.tokSymbol} transaction balance equals account balance.`);

  return records;
}

async function getAccountBalance (accountInfo) {
  t.AccessorAccountInfo().assert(accountInfo);

  const tokSymbol = accountInfo.tokSymbol;
  const tokBalance = accountInfo.tokBalance;
  const date = new Date();

  const balanceRec = {
    tokSymbol: tokSymbol,
    tokBalance: tokBalance,
    usdTokRate: await prices.getUsdFrom(tokSymbol, date, 1),
    usdBalance: await prices.getUsdFrom(tokSymbol, date, tokBalance),
    nokUsdRate: await prices.getNokFrom('USD', date, 1),
    nokBalance: await prices.getNokFrom(tokSymbol, date, tokBalance)
  };

  t.OutputAccountBalance().assert(balanceRec);

  return balanceRec;
}

async function getTransactionsYearBalance (symbol, transactions, date) {
  t.string().assert(symbol);
  t.array(t.OutputTransactionRecord()).assert(transactions);
  t.class(Date).assert(date);

  const tx = transactions.slice().reverse().find(tx => tx.date.valueOf() <= date.valueOf());

  const balanceRec = {
    date: date,
    tokSymbol: symbol,
    tokBalance: tx ? tx.tokBalance : 0,
    usdTokRate: tx ? await prices.getUsdFrom(tx.tokSymbol, date, 1) : 0,
    usdBalance: tx ? await prices.getUsdFrom(tx.tokSymbol, date, tx.tokBalance) : 0,
    nokUsdRate: tx ? await prices.getNokFrom('USD', tx.date, 1) : 0,
    nokBalance: tx ? await prices.getNokFrom(tx.tokSymbol, date, tx.tokBalance) : 0
  };

  t.OutputYearBalance().assert(balanceRec);

  return balanceRec;
}

// Public

async function getTransactionsTable (accountInfo, date) {
  t.AccessorAccountInfo().assert(accountInfo);
  t.class(Date).assert(date);

  const txRecords = await getTransactionRecords(accountInfo);

  const table = {
    header: getTransactionsHeader(accountInfo),
    records: txRecords,
    accountBalance: await getAccountBalance(accountInfo),
    yearBalance: await getTransactionsYearBalance(accountInfo.tokSymbol, txRecords, date)
  }

  t.OutputTransactionTable().assert(table);

  return table;
}

module.exports = {
  getTransactionsTable
};
