'use strict';

require('../../../runtime-types/address-string');

const t = require('flow-runtime');
const assert = require('assert');

const { formatUnits, bigNumberify } = require('ethers').utils;

const data = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000'.toLowerCase()
  },
  {
    symbol: 'HBT',
    name: 'Hubiits',
    decimals: 15,
    address: '0xdd6c68bb32462e01705011a4e2ad1a60740f217f'.toLowerCase()
  },
  {
    symbol: 'NII',
    name: 'Nahmii',
    decimals: 15,
    address: '0xac4f2f204b38390b92d0540908447d5ed352799a'.toLowerCase()
  },
  {
    symbol: 'AURA',
    name: 'Aurora',
    decimals: 18,
    address: '0xcdcfc0f66c522fd086a1b725ea3c0eeb9f9e8814'.toLowerCase()
  },
  {
    symbol: 'IDEX',
    name: 'IDEX Token',
    decimals: 18,
    address: '0xB705268213D593B8FD88d3FDEFF93AFF5CbDcfAE'.toLowerCase()
  },
];

const _fromSymbolMap = data.reduce((map, item) => (map.set(item.symbol, item), map), new Map());
const _fromAddressMap = data.reduce((map, item) => (map.set(item.address, item), map), new Map());


const currencies = {
  unitStrToNumber: (symbol, unitStr) => {
    t.string().assert(symbol);
    t.string().assert(unitStr);
    assert(_fromSymbolMap.has(symbol));

    const decimals = _fromSymbolMap.get(symbol).decimals;
    const wei = bigNumberify(unitStr);
    const str = formatUnits(wei, decimals);
    const number = Number.parseFloat(str);
    return number;
  },

  getSymbol: (contractAddress) => {
    t.AddressString().assert(contractAddress);
    assert(_fromAddressMap.has(contractAddress));

    return _fromAddressMap.get(contractAddress);
  }
};

module.exports = currencies;
