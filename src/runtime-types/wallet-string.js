'use strict';

require('./address-string');
const t = require('flow-runtime');

const WalletString = t.refinement(t.any(), input => {
  if (!t.AddressString().accepts(input) && !/Type /.test(input))
    return 'must be an wallet address or a wallet type';
});

t.WalletString = () => WalletString;
