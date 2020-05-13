'use strict';

require('../../../runtime-types/wallet-string');
const t = require('flow-runtime');

const OutputTransactionsHeader = t.object({
  exchange: t.string(),
  symbol: t.string(),
  wallet: t.WalletString()
});

t.OutputTransactionsHeader = () => OutputTransactionsHeader;
