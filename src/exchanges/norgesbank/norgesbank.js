'use static';

// Documentation: https://www.norges-bank.no/tema/Statistikk/apne-data/tilgjengelige-data/
// Example: https://data.norges-bank.no/api/data/EXR/M.CHF.NOK.SP?startPeriod=2010-01
// Date format: 2010-01
// Hente data: https://www.norges-bank.no/tema/Statistikk/apne-data/hente-data/

const superagent = require('superagent');
const ethers = require('ethers');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');

const etherscanKey = config.keys.etherscan;

async function requestRates(query) {
  const res = await superagent
  .get(query)
  .set('Accept', 'application/json');
  //console.log(res.body.result);
  const rates = Object.values(res.body.dataSets[0].series['0:0:0:0'].observations);
  const dates = res.body.structure.dimensions.observation[0].values;
  const keys = Array.from(dates.keys());

  if (rates.length !== dates.length)
    throw new Error('Failed to match rates and dates in norgesbank exchane rates');

  result = keys.reduce((acc, i) => (acc[dates[i].id] = Number(rates[i]), acc), {});

  return result;

  // res.body.dataSets[0].series['0:0:0:0'].observations[i]
  // res.body.structure.dimensions.observation[0].values[i].id
}

async function requestUsdRates(startYear, endYear) {
  const query = `https://data.norges-bank.no/api/data/EXR/B.USD.NOK.SP?startPeriod=${startYear}&endPeriod=${endYear}&format=sdmx-json`;
  return requestRates(query);
}

async function requestUsdRatesTest() {
  return requestUsdRates('2018', '2019');
}

module.exports = {
  requestUsdRatesTest
};
