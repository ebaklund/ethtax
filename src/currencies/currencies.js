'use strict';

const currencies = {
  supportedSymbols: [ 'ETH', 'HBT', 'NII', 'AURA' ],
  ETH: {
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000'
  },
  HBT: {
    name: 'Hubiits',
    decimals: 15,
    address: '0xdd6c68bb32462e01705011a4e2ad1a60740f217f'
  },
  NII: {
    name: 'Nahmii',
    decimals: 15,
    address: '0xac4f2f204b38390b92d0540908447d5ed352799a',
  },
  AURA: {
    name: 'Aurora',
    decimals: 18,
    address: '0xcdcfc0f66c522fd086a1b725ea3c0eeb9f9e8814'
  },
  unitStrToNumber: (symbol, unitStr) => {
    const tokDecimals = currencies[symbol].decimals;
    const valDecimals = 6;
    //const typeOf = typeof unitStr;
    const valueStr = unitStr.slice(0, valDecimals - tokDecimals);
    const number = Number(valueStr) / Math.pow(10, valDecimals);
    return number;
  }
};

module.exports = currencies;
