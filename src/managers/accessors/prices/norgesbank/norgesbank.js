'use static';

// Documentation: https://www.norges-bank.no/tema/Statistikk/apne-data/tilgjengelige-data/
// Example: https://data.norges-bank.no/api/data/EXR/M.CHF.NOK.SP?startPeriod=2010-01
// Date format: 2010-01
// Hente data: https://www.norges-bank.no/tema/Statistikk/apne-data/hente-data/

require('../../../../runtime-types/definite-number');
require('../../../../runtime-types/year4-number');
const t = require('flow-runtime');

const superagent = require('superagent');

const config = require('../../../../app/config');
const NestedError = require('../../../../utils/nested-error');


async function requestUsdRates(startYear, endYear) {
  t.Year4().assert(startYear);
  t.Year4().assert(endYear);

  const query = `https://data.norges-bank.no/api/data/EXR/B.USD.NOK.SP?startPeriod=${startYear}&endPeriod=${endYear}&format=sdmx-json`;

  console.log(` *** QUERY: ${query}`);

  const res = await superagent
    .get(query)
    .set('Accept', 'application/json');

  const rates = Object.values(res.body.dataSets[0].series['0:0:0:0'].observations);
  const keys = res.body.structure.dimensions.observation[0].values.map(item => item.name);

  if (rates.length !== keys.length)
    throw new Error('Failed to match rates and keys in norgesbank exchange rates');

  const usdRates = [];

  for (let i = 0; i < keys.length; ++i) {
    const rate = 1 * rates[i][0];

    t.DefiniteNumber().assert(rate);

    usdRates.push({
      key: (new Date(keys[i])).toISOString().split('T')[0],
      nok: rate
    });
  }

  const sortedUsdRates = usdRates.sort((a,b) => b.key.localeCompare(a.key));

  return sortedUsdRates;
}

let _usdRates;

async function getNokFromUsd(date, usd=1) {
  t.class(Date).assert(date);
  t.DefiniteNumber().assert(usd);

  if (!_usdRates) {
    const now = new Date();
    const endYear = now.getUTCFullYear();
    const startYear = 2016;

    _usdRates = await requestUsdRates(startYear, endYear);
  }

  const date2 = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ));
  const key = date2.toISOString().split("T")[0];
  const item = _usdRates.find(item => item.key <= key);

  const res =  item.nok * usd;

  t.DefiniteNumber().assert(res);

  return res;
}

module.exports = {
  requestUsdRates,
  getNokFromUsd
};
