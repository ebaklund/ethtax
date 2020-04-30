'use strict';

require('../../../runtime-types/ethereum-address');

const t = require('flow-runtime');

const OutputTransactionsHeader = t.object({
  exchange: t.string(),
  address: t.string()
});

t.OutputTransactionsHeader = () => OutputTransactionsHeader;
