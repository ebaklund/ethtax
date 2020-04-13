'use static';

// Documentation: https://www.norges-bank.no/tema/Statistikk/apne-data/tilgjengelige-data/
// Example: https://data.norges-bank.no/api/data/EXR/M.CHF.NOK.SP?startPeriod=2010-01
// Date format: 2010-01
// Hente data: https://www.norges-bank.no/tema/Statistikk/apne-data/hente-data/

const superagent = require('superagent');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');


async function requestUsdRates(startYear, endYear) {
  const query = `https://data.norges-bank.no/api/data/EXR/B.USD.NOK.SP?startPeriod=${startYear}&endPeriod=${endYear}&format=sdmx-json`;

  const res = await superagent
    .get(query)
    .set('Accept', 'application/json');

  const rates = Object.values(res.body.dataSets[0].series['0:0:0:0'].observations);
  const keys = res.body.structure.dimensions.observation[0].values.map(item => item.name);

  if (rates.length !== keys.length)
    throw new Error('Failed to match rates and keys in norgesbank exchange rates');

  const usdRates = [];

  for (let i = 0; i < keys.length; ++i) {
    usdRates.push({
      key: (new Date(keys[i])).toISOString().split('T')[0],
      nok: rates[i][0]
    });
  }

  const sortedUsdRates = usdRates.sort((a,b) => b.key.localeCompare(a.key));

  return sortedUsdRates;
}

let _usdRates;

async function getNokFromUsd(date, usd=1) {
  if (!_usdRates) {
    const now = new Date();
    const endYear = now.getUTCFullYear();
    const startYear = 2016;

    _usdRates = await requestUsdRates(startYear, endYear);
  }

  const date2 = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ));
  const key = date2.toISOString().split("T")[0];
  const item = _usdRates.find(item => item.key <= key);

  return item.nok * usd;
}

module.exports = {
  requestUsdRates,
  getNokFromUsd
};
