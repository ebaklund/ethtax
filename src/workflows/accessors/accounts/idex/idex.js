'use strict';

// Documentation: https://docs.idex.market/#operation/returnTradeHistory

const idexEth = require('./idex-eth');
const idexHbt = require('./idex-hbt');

async function getRecordsFromSymbol (symbol, addr) {
  switch (symbol) {
    case 'ETH': return await idexEth.getEthRecords(addr);
    case 'HBT': return await idexHbt.getHbtRecords(addr);
  }

  throw new Error (`Failed to get records. Symbol ${symbol} is not recognized.`);
}

module.exports = {
  getRecordsFromSymbol
};
