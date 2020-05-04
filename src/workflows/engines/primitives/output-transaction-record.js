'use strict';

require('../../../runtime-types/definite-number');
require('../../../runtime-types/definite-pos-number');
const t = require('flow-runtime');

const OutputTransactionRecord = t.object({
    date: t.class(Date),
    tokSymbol: t.string(),
    tokAmount: t.DefiniteNumber(),
    fee: t.DefinitePosNumber(),
    tokBalance: t.DefinitePosNumber(),
    usdTokRate: t.DefiniteNumber(),
    usdAmount: t.DefiniteNumber(),
    usdBalance: t.DefinitePosNumber(),
    nokUsdRate: t.DefiniteNumber(),
    nokAmount: t.DefiniteNumber(),
    nokBalance: t.DefinitePosNumber(),
    misc: t.any()
});

t.OutputTransactionRecord = () => OutputTransactionRecord;
