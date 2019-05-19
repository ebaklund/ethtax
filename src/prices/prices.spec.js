'use strict';

const chai = require('chai');
const expect = chai.expect;

const prices = require('./prices');

describe('prices', () => {
  const addr = '0xfb7836f8a571e4a167c34ca643a2a6e3224ecb8b';

  it ('Can get key from date', async () => {
    const key = prices.getKeyFromDate(new Date('December 17, 1995 03:24:00'));
    expect(key).to.equal('1995-12-17');
  });

  it ('Finds rate from exact date', async () => {
    const rate = await prices.getUsdRateFromDate(new Date('December 17, 2018 12:24:00'));
    expect(rate).to.equal(8.6269);
  });

  it ('Finds rate from passed date', async () => {
    const rate = await prices.getUsdRateFromDate(new Date('January 7, 2018 12:24:00'));
    expect(rate).to.equal(8.0878);
  });

  it ('Finds NOK from USD', async () => {
    const rate = await prices.getNokFromUsd(new Date('January 7, 2018 12:24:00'), 2);
    expect(rate).to.equal(16.1756);
  });
});