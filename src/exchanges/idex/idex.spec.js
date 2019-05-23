'use strict';

const chai = require('chai');
const expect = chai.expect;

const idex = require('./idex-exchange');

describe('idex-exchange', () => {
  const addr = '0xfb7836f8a571e4a167c34ca643a2a6e3224ecb8b';

  describe('Get eth transactions', () => {
    xit ('receives trade history', async () => {
      const history = await idex.getTradeHistory("ETH_HBT", addr);
      expect(history.length).to.be.gt(0);
    })

    xit ('receives deposit history', async () => {
      const history = await idex.getBalanceHistory(addr);
      expect(history.length).to.be.gt(0);
    })

    xit ('receives ETH trade history', async () => {
      const history = await idex.getEthTradeHistory(addr);
      expect(history.length).to.be.gt(0);
    })

    xit ('receives ETH deposit history', async () => {
      const history = await idex.getEthBalanceHistory(addr);
      expect(history.length).to.be.gt(0);
    })

    xit ('receives HBT trade history', async () => {
      const history = await idex.getHbtTradeHistory(addr);
      expect(history.length).to.be.gt(0);
    })

    xit ('receives HBT deposit history', async () => {
      const history = await idex.getHbtDepositHistory(addr);
      expect(history.length).to.be.gt(0);
    })

    it ('receives ETH records', async () => {
      const history = await idex.getEthRecords(addr);
      expect(history.length).to.be.gt(0);
    })
  })
});