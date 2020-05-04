'use strict';

require('../../../../runtime-types/definite-pos-number');
require('../../../../runtime-types/ethereum-address');
require('./accessor-transaction-info');
const t = require('flow-runtime');

const _AccessorAccountInfo = t.object({
  exchange: t.string(),
  type: t.string(),
  address: t.string(),
  tokSymbol: t.string(),
  tokBalance: t.DefinitePosNumber(),
  transactions: t.array(t.AccessorTransactionInfo())
});

const AccessorAccountInfo = t.refinement(_AccessorAccountInfo, input => {
  let runningDate = new Date(0);

  const someDescending = input.transactions.some(tx => {
    const isDesc = tx.date.valueOf() < runningDate.valueOf()
    runningDate = tx.date;

    return isDesc;
  });

  if (someDescending)
    return 'must only contain transactions in ascending order';
});

t.AccessorAccountInfo = () => AccessorAccountInfo;
