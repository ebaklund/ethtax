'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const expect = chai.expect;
const component = describe;
const scenario = describe;
const given = describe;
const when = describe;
const then = it;

const config = require('../../../../app/config');
const EtherscanAccessor = require('./etherscan-accessor');

describe('etherscan-accessor', () => {
  let etherscan;

  beforeEach(() => {
    etherscan = new EtherscanAccessor(config.etherscan.apiKey);
  });

  scenario('retrieve account infos', () => {
    given('working system', () => {
      when('account infos are requested for valid wallets', () => {
        then('success', () => {
          return expect(etherscan.getAccountInfos(config.addresses)).to.eventually.be.fulfilled;
        });
      });
    });
  });
});