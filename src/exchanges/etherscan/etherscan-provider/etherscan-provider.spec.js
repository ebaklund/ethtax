'use strict';

const chai = require('chai');
const expect = chai.expect;

const provider = require('./etherscan-provider');
const addresses = require('../../../config').addresses;
const currencies = require('../../../currencies');

describe('etherscan-provider', () => {

  it ('gets latest Ether balance for a single Address', async () => {
    const balanceStr = await provider.requestLatestEthBalance(addresses[0]);
    const balance = currencies.unitStrToNumber('ETH', balanceStr);
    expect(balance).to.not.be.undefined;
  });

  it ('gets latest Token balance for a single Address', async () => {
    const hbtAddr = currencies['HBT'].address;
    const balanceStr = await provider.requestLatestTokBalance(hbtAddr, addresses[0]);
    const balance = currencies.unitStrToNumber('HBT', balanceStr);
    expect(balance).to.not.be.undefined;
  });

  it ('gets Ethereum transactions for a single Address', async () => {
    const txs = await provider.requestEthereumTransactions(addresses[0]);
    expect(txs.length).to.be.gt(0);
  });

  it ('gets Token transactions for a single Address', async () => {
    const txs = await provider.requestTokenTransactions(addresses[0]);
    expect(txs.length).to.be.gt(0);
  });

  it ('gets Internal transactions for a single Address', async () => {
    const txs = await provider.requestInternalTransactions(addresses[6]);
    expect(txs.length).to.be.gt(0);
  });
});