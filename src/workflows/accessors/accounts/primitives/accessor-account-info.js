'use strict';

require('../../../../runtime-types/valid-pos-float');
require('../../../../runtime-types/ethereum-address');
require('./accessor-transaction-info');
const t = require('flow-runtime');

const AccessorAccountInfo = t.object({
  exchange: t.string(),
  type: t.string(),
  address: t.string(),
  tokSymbol: t.string(),
  tokBalance: t.ValidPosFloat(),
  transactions: t.array(t.AccessorTransactionInfo())
});

t.AccessorAccountInfo = () => AccessorAccountInfo;
