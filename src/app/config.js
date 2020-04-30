'use strict';

// Environment variables are defined in: '~/ethtax_env'
// > eval $(~/ethtax_env)

module.exports = {
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  coinmarketcap: {
    apiKey: process.env.COINMARKETCAP_API_KEY
  },
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    apiSecret: process.env.COINBASE_API_SECRET
  },
  addresses: [
    '0xfb7836f8a571e4a167c34ca643a2a6e3224ecb8b',
    '0x7dd16DdbfF792289DA1961D9eB6ACd814345F9Fc',
    '0x4c12b2E42CdA23a526D77a4F7947202f28f190eE',
    '0x071d423B2dADb867Be766E23a4000332dDD8FF3e',
    '0xE98b4CabE43CFfA277D3C923E83dB81c5A31E43c',
    '0xe3fd53373195e4d34a8f9c6189f5c6c38dae0f14',
    '0x1ce555afbd5b5f837147bcae8762ad7779e0b6d6',
    '0xE17f4aB424F00aE9ECb39AD3d87448c418839CB6'
  ].map(a => a.toLowerCase())
};