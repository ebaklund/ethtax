'use strict';

const t = require('flow-runtime');

const EthereumAddress = t.refinement(t.string(), input => {
  if (!/0x[0-9a-f]{20}/.test(input))
    return 'must be an EthereumAddress (lower case)';
});

t.EthereumAddress = () => EthereumAddress;
