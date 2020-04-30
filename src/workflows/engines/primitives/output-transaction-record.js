'use strict';

require('../../../runtime-types/valid-float');
require('../../../runtime-types/valid-pos-float');
const t = require('flow-runtime');

const OutputTransactionRecord = t.object({
    date: t.class(Date),
    tokSymbol: t.string(),
    tokAmount: t.ValidFloat(),
    fee: t.ValidPosFloat(),
    tokBalance: t.ValidPosFloat(),
    usdTokRate: t.ValidFloat(),
    usdAmount: t.ValidFloat(),
    usdBalance: t.ValidPosFloat(),
    nokUsdRate: t.ValidFloat(),
    nokAmount: t.ValidFloat(),
    nokBalance: t.ValidPosFloat(),
    misc: t.any()
});

t.OutputTransactionRecord = () => OutputTransactionRecord;
