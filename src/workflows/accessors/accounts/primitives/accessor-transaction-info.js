'use strict';

require('../../../../runtime-types/valid-float');
const t = require('flow-runtime');

const AccessorTransactionInfo = t.object({
  date: t.class(Date),
  tokSymbol: t.string(),
  tokAmount: t.ValidFloat(), // Signed
  fee: t.ValidFloat(),
  misc: t.any()
});

t.AccessorTransactionInfo = () => AccessorTransactionInfo;
