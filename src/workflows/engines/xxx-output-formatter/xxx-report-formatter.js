'use strict';

require('../primitives/output-transactions-header');
require('../primitives/output-transaction-record');
require('../primitives/output-account-balance');
require('../primitives/output-year-balance');
require('../primitives/output-transaction-table');
const t = require('flow-runtime');

// private

function fmtAmount(amount) {
  const text = ((curr < 0) ? '' : ' ') + amount.toFixed(4);
  const indent = Math.max(0, 12 - text.length);
  const formatted = ' '.repeat(indent) + text;

  return formatted;
}

function getFormattedTransactionsHeader (outputHeader) {
  t.OutputTransactionsHeader(outputHeader);

  const rec = outputHeader;

  let line = `${rec.exchange} ${rec.address || '(no address BBB')}`);

  return line;
}

function getFormattedTransactionsRecord (outputRecord) {
  t.OutputTransactionRecord(outputRecord);

  const rec = outputRecord;
  const smb = rec.symbol.toLowerCase();

  let line = '';
  line += `${rec.symbol}, ${rec.date.toISOString()}, `;
  line += `${fmtAmount(rec.tokAmount)} ${smb}, ${fmtAmount(rec.fee)} eth, ${fmtAmount(rec.tokBalance)} ${smb}, `;
  line += `${fmtAmount(rec.usdTokRate)} usd/${smb}, ${fmtAmount(rec.usdAmount)} usd, ${fmtAmount(rec.usdBalance)} usd, `;
  line += ` ${fmtAmount(rec.nokUsdRate)} nok/usd, ${fmtAmount(rec.nokAmount)} nok, ${fmtAmount(rec.nokBalance)} nok`;

  return line;
}

function getFormattedAccountBalance (outputAccountBalance) {
  t.OutputAccountBalance(outputAccountBalance);

  const rec = outputAccountBalance;
  const smb = rec.symbol.toLowerCase();

  let line = '';
  line += 'Account balance                                     ';
  line += `${fmtAmount(rec.tokAmount)} ${smb}`;

  return line;
}

function getFormattedYearBalance (yearBalance) {
  t.OutputTransactionsBalance(yearBalance);

  const rec = yearBalance;
  const smb = rec.symbol.toLowerCase();

  let line = '';
  line += `${caption} ${rec.date.toISOString()}, `;
  line += `                  ${fmtAmount(rec.tokBalance)} ${smb}, `;
  line += `${fmtAmount(rec.usdTokRate)} usd/${smb},                   ${fmtAmount(rec.usdBalance)} usd,  `;
  line += `${fmtAmount(rec.nokUsdRate)} nok/usd,                   ${fmtAmount(rec.nokBalance)} nok`;

  return line;
}

// Public

function getFormattedTransactionTable (transactionTable) {
  t.OutputTransactionTable().assert(transactionTable);

  const txTable = transactionTable;

  let text = '';
  text += getFormattedTransactionsHeader(txTable.header);

  for (const record of txTable.records)
    text += getFormattedTransactionRecord(txTable.records);

  text += getFormattedAccountBalance(txTable.accountBalance);
  text += getFormattedYearBalance(txTable.yearBalance);

  return text;
}

/*
module.exports = {
 getFormattedTransactionTable
};
*/
