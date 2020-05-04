'use strict';

require('../../../runtime-types/definite-number');
require('../../../runtime-types/definite-pos-number');
const t = require('flow-runtime');

const OutputAccountBalance = t.object({
  tokSymbol: t.string(),
  tokBalance: t.DefinitePosNumber(),
  usdTokRate: t.DefiniteNumber(),
  usdBalance: t.DefinitePosNumber(),
  nokUsdRate: t.DefiniteNumber(),
  nokBalance: t.DefinitePosNumber()
});

t.OutputAccountBalance = () => OutputAccountBalance;
