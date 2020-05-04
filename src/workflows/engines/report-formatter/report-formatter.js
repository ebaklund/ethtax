'use strict';

require('../primitives/output-transactions-header');
require('../primitives/output-transaction-record');
require('../primitives/output-account-balance');
require('../primitives/output-year-balance');
require('../primitives/output-transaction-table');
require('../../../runtime-types/definite-number');
const t = require('flow-runtime');

// private

const fmtWidth = {
  symbol: 6,
  date: 25,
  address: 21,
  amount: 17,
  rate: 21
};

function fmtField (str, fieldWidth) {
  t.string().assert(str);
  t.number().assert(fieldWidth);

  const count = Math.max(0, fieldWidth - str.length);
  const fmt = ' '.repeat(count) + str;

  return fmt;
}

function fmtAmount(amount, unit, fieldWidth) {
  t.DefiniteNumber().assert(amount);
  t.string().assert(unit);
  t.number().assert(fieldWidth);

  const str = `${((amount < 0) ? '' : ' ') + amount.toFixed(4)} ${unit}`
  const fmt = fmtField(str, fieldWidth);

  return fmt;
}

function getFormattedTransactionsHeader (outputHeader) {
  t.OutputTransactionsHeader(outputHeader);

  const head = outputHeader;

  let line = '';
  line += `${fmtField(head.exchange + ' ' + (head.address || '(no address)'), 0)}\n`;
  line += `${fmtField('Symbol', fmtWidth.symbol)},`;
  line += `${fmtField('Date', fmtWidth.date)},`;
  line += `${fmtField('Amount', fmtWidth.amount)},`;
  line += `${fmtField('Fee', fmtWidth.amount)},`;
  line += `${fmtField('Balance', fmtWidth.amount)},`;
  line += `${fmtField('Rate', fmtWidth.rate)},`;
  line += `${fmtField('Amount', fmtWidth.amount)},`;
  line += `${fmtField('Balance', fmtWidth.amount)},`;
  line += `${fmtField('Rate', fmtWidth.rate)},`;
  line += `${fmtField('Amount', fmtWidth.amount)},`;
  line += `${fmtField('Balance', fmtWidth.amount)}`;

  return line;

  return line;
}

function getFormattedTransactionRecord (outputRecord) {
  t.OutputTransactionRecord(outputRecord);

  const rec = outputRecord;
  const smb = rec.tokSymbol.toLowerCase();

  let line = '';
  line += `${fmtField(rec.tokSymbol, fmtWidth.symbol)},`;
  line += `${fmtField(rec.date.toISOString(), fmtWidth.date)},`;
  line += `${fmtAmount(rec.tokAmount, smb, fmtWidth.amount)},`;
  line += `${fmtAmount(rec.fee, 'eth', fmtWidth.amount)},`;
  line += `${fmtAmount(rec.tokBalance, smb, fmtWidth.amount)},`;
  line += `${fmtAmount(rec.usdTokRate, 'usd/'+smb, fmtWidth.rate)},`;
  line += `${fmtAmount(rec.usdAmount, 'usd', fmtWidth.amount)},`;
  line += `${fmtAmount(rec.usdBalance, 'usd', fmtWidth.amount)},`;
  line += `${fmtAmount(rec.nokUsdRate, 'nok/usd', fmtWidth.rate)},`;
  line += `${fmtAmount(rec.nokAmount, 'nok', fmtWidth.amount)},`;
  line += `${fmtAmount(rec.nokBalance, 'nok', fmtWidth.amount)}`;

  return line;
}

function getFormattedAccountBalance (outputAccountBalance) {
  t.OutputAccountBalance(outputAccountBalance);

  const rec = outputAccountBalance;
  const smb = rec.tokSymbol.toLowerCase();

  let line = '';
  line += `${fmtField('Account balance', fmtWidth.symbol + fmtWidth.date + 1)},`;
  line += `${fmtField('', 2 * fmtWidth.amount + 2)}`;
  line += `${fmtAmount(rec.tokBalance, smb, fmtWidth.amount)},`;
  line += `${fmtAmount(rec.usdTokRate, 'usd/' + smb, fmtWidth.rate)},`;
  line += `${fmtAmount(rec.usdBalance, 'usd', 2 * fmtWidth.amount + 1)},`;
  line += `${fmtAmount(rec.nokUsdRate, 'nok/usd', fmtWidth.rate)},`;
  line += `${fmtAmount(rec.nokBalance, 'nok', 2 * fmtWidth.amount + 1)}`;

  return line;
}

function getFormattedYearBalance (yearBalance) {
  t.OutputYearBalance(yearBalance);

  const rec = yearBalance;
  const smb = rec.tokSymbol.toLowerCase();

  let line = '';
  line += `${fmtField('Year balance', fmtWidth.symbol + fmtWidth.date + 1)},`;
  line += `${fmtField(rec.date.toString().split(' ').slice(0, 6).join(' '), 2 * fmtWidth.amount + 1)},`;
  line += `${fmtAmount(rec.tokBalance, smb, fmtWidth.amount)},`;
  line += `${fmtAmount(rec.usdTokRate, 'usd/' + smb, fmtWidth.rate)},`;
  line += `${fmtAmount(rec.usdBalance, 'usd', 2 * fmtWidth.amount + 1)},`;
  line += `${fmtAmount(rec.nokUsdRate, 'nok/usd', fmtWidth.rate)},`;
  line += `${fmtAmount(rec.nokBalance, 'nok', 2 * fmtWidth.amount + 1)}`;

  return line;
}

// Public

function getFormattedTransactionTable (transactionTable) {
  t.OutputTransactionTable().assert(transactionTable);

  const txTable = transactionTable;

  let text = '';
  text += (getFormattedTransactionsHeader(txTable.header) + '\n');

  for (const record of txTable.records)
    text += (getFormattedTransactionRecord(record) + '\n');

  text += (getFormattedAccountBalance(txTable.accountBalance) + '\n');
  text += (getFormattedYearBalance(txTable.yearBalance) + '\n');

  return text;
}

module.exports = {
 getFormattedTransactionTable
};
