'use strict';

// Environment variables are defined in: '~/ethtax_env'
// > eval $(~/ethtax_env)


function get_env_variable(var_name) {
  if (process.env[var_name] == undefined) {
    throw new Error(
      '\n' +
      `Required environment variable \"${var_name}\" is not defined.\n` +
      'Did you to forget to source credential file: \"eval $(~/ethtax_env)\"?\n' +
      '\n'
    )
  }

  return process.env[var_name];
}

module.exports = {
  idex: {
    apiKey: get_env_variable('IDEX_API_KEY')
  },
  etherscan: {
    apiKey: get_env_variable('ETHERSCAN_API_KEY')
  },
  coinmarketcap: {
    apiKey: get_env_variable('COINMARKETCAP_API_KEY')
  },
  coinbase: {
    apiKey: get_env_variable('COINBASE_API_KEY'),
    apiSecret: get_env_variable('COINBASE_API_SECRET')
  },
  addresses: [
    '0xe3fd53373195e4d34a8f9c6189f5c6c38dae0f14', // Cold paper
    '0xfb7836f8a571e4a167c34ca643a2a6e3224ecb8b', // Ledger
    '0x7dd16DdbfF792289DA1961D9eB6ACd814345F9Fc', // Ledger
    '0x4c12b2E42CdA23a526D77a4F7947202f28f190eE', // Ledger
    '0x071d423B2dADb867Be766E23a4000332dDD8FF3e', // Ledger
    '0xE98b4CabE43CFfA277D3C923E83dB81c5A31E43c', // Ledger
    '0xe3fd53373195e4d34a8f9c6189f5c6c38dae0f14', // Ledger
    '0x1ce555afbd5b5f837147bcae8762ad7779e0b6d6', // Ledger
    '0xE17f4aB424F00aE9ECb39AD3d87448c418839CB6', // Ledger
  ].map(a => a.toLowerCase())
};