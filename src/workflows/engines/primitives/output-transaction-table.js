'use strict';

require('./output-transactions-header');
require('./output-transaction-record');
require('./output-account-balance');
require('./output-year-balance');

const t = require('flow-runtime');

const OutputTransactionTable = t.object({
  header: t.OutputTransactionsHeader(),
  records: t.array(t.OutputTransactionRecord()),
  accountBalance: t.OutputAccountBalance(),
  yearBalance: t.OutputYearBalance()
});

t.OutputTransactionTable = () => OutputTransactionTable;
