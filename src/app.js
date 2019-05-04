'use strict';

const superagent = require('superagent');

const config = require('./config');
const NestedError = require('./utils/nested-error');
const etherscan = require('./exchanges/etherscan');

let keepaliveExitPromise;

process.on('unhandledRejection', (err /*, promise*/) => {
  console.log('\n\nError: ' + NestedError.asStringified(err));
  keepaliveExitPromise = new Promise((resolve, reject) => setTimeout(() => process.exit(0), 1000));
  throw error;
});


console.log('etherscan_key: ' + config.keys.etherscan);
console.log('cmc_key: ' + config.keys.cmc);

(async () => {
  for (let addr of config.addresses.slice(0, 2)) {
    addr = addr.toLowerCase();
    const recs = await etherscan.getEthRecords(addr);
    console.log(JSON.stringify(recs, null, 2));
  }
})();

/* ETH
     { blockNumber: '6701742',
       timeStamp: '1542181686',
       hash:
        '0x7d985467c9b30192a9e1e497098ba835ec8d08f377dfe2c955d6f571a7bc2152',
       nonce: '7',
       blockHash:
        '0x4f89934eefbdb7a66c22ec9fd81641d65199c4453fb226169ac68f88170bda37',
       transactionIndex: '34',
       from: '0xfb7836f8a571e4a167c34ca643a2a6e3224ecb8b',
       to: '0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208',
       value: '5000637375000000000',
       gas: '250000',
       gasPrice: '5000000000',
       isError: '0',
       txreceipt_status: '1',
       input: '0xd0e30db0',
       contractAddress: '',
       cumulativeGasUsed: '2282143',
       gasUsed: '34725',
       confirmations: '952926' } ] }

   HBT
   { blockNumber: '7253424',
    timeStamp: '1550845713',
    hash:
     '0xce41fa62c88397b476ae82728af681a1a721756a162b9bc5d0b7648509eac5b2',
    nonce: '298',
    blockHash:
     '0xb89a76c06a28ab8aa8d7a5735e3670de23e26846a1af2e59c908c6c793a4900e',
    from: '0xa4793e13f77bf49dea75423ecc858829d4262a4b',
    contractAddress: '0xdd6c68bb32462e01705011a4e2ad1a60740f217f',
    to: '0x7dd16ddbff792289da1961d9eb6acd814345f9fc',
    value: '3000000000000000000',
    tokenName: 'Hubiits',
    tokenSymbol: 'HBT',
    tokenDecimal: '15',
    transactionIndex: '157',
    gas: '100000',
    gasPrice: '10000000000',
    gasUsed: '37379',
    cumulativeGasUsed: '7014067',
    input:
     '0xa9059cbb0000000000000000000000007dd16ddbff792289da1961d9eb6acd814345f9fc00000000000000000000000000000000000000000000000029a2241af62c0000',
    confirmations: '401454' }
*/