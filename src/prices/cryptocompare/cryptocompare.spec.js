'use strict';

const chai = require('chai');
const expect = chai.expect;

const cryptocompare = require('./cryptocompare');

describe ('prices/cryptocompare', () => {
  it ('can get eth rates', async () => {
    const rates = await cryptocompare.requestEthRates();
    expect(rates.length).to.be.gt(0);
  });

  it ('can get hbt rates', async () => {
    const rates = await cryptocompare.requestHbtRates();
    expect(rates.length).to.be.gt(0);
  });

  it ('can get nii rates', async () => {
    const rates = await cryptocompare.requestNiiRates();
    expect(rates.length).to.be.gt(0);
  });

  it ('finds eth rate from exact date', async () => {
    const usd = await cryptocompare.getUsdFromEth(new Date('December 16, 2018 12:24:00'));
    expect(usd).to.equal(85.39);
  });

  it ('finds hbt rate from exact date', async () => {
    const usd = await cryptocompare.getUsdFromHbt(new Date('December 14, 2018 12:24:00'));
    expect(usd).to.equal(0.06964);
  });

});