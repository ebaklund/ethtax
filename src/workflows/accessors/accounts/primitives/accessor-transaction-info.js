'use strict';

require('../../../../runtime-types/definite-number');
const t = require('flow-runtime');

const AccessorTransactionInfo = t.object({
  date: t.class(Date),
  tokSymbol: t.string(),
  tokAmount: t.DefiniteNumber(), // Signed
  fee: t.DefiniteNumber(),
  misc: t.any()
});

t.AccessorTransactionInfo = () => AccessorTransactionInfo;
