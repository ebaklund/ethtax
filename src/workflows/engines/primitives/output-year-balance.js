'use strict';

require('../../../runtime-types/valid-float');
require('../../../runtime-types/valid-pos-float');
const t = require('flow-runtime');

const OutputYearBalance = t.object({
  date: t.class(Date),
  tokSymbol: t.string(),
  tokBalance: t.ValidPosFloat(),
  usdTokRate: t.ValidFloat(),
  usdBalance: t.ValidPosFloat(),
  nokUsdRate: t.ValidFloat(),
  nokBalance: t.ValidPosFloat()
});

t.OutputYearBalance = () => OutputYearBalance;
