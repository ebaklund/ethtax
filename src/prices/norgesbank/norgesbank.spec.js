'use strict';

const chai = require('chai');
const expect = chai.expect;

const norgesbank = require('./norgesbank');

describe ('prices/norgesbank', () => {
  it ('can get usd rates', async () => {
    const rates = await norgesbank.requestUsdRates('2016', '2017');
    expect(rates.length).to.be.gt(0);
    expect(rates[0].key).to.be.equal('2017-12-29');
    expect(rates[rates.length - 1].key).to.be.equal('2016-01-04');
  });

  it ('usd rates are sorted in descending order new to old', async () => {
    const rates = await norgesbank.requestUsdRates('2016', '2017');
    expect(rates[0].key).to.be.equal('2017-12-29');
    expect(rates[rates.length - 1].key).to.be.equal('2016-01-04');
  });

  it ('finds usd rate from exact date', async () => {
    const nok = await norgesbank.getNokFromUsd(new Date('December 17, 2018 12:24:00'));
    expect(nok).to.equal(8.6269);
  });

  it ('finds usd rate from passed date', async () => {
    const nok = await norgesbank.getNokFromUsd(new Date('January 7, 2018 12:24:00'));
    expect(nok).to.equal(8.0878);
  });

  it ('finds nok from usd', async () => {
    const nok = await norgesbank.getNokFromUsd(new Date('January 7, 2018 12:24:00'), 2);
    expect(nok).to.equal(16.1756);
  });

});