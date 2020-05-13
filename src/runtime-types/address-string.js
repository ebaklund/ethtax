'use strict';

const t = require('flow-runtime');

const AddressString = t.refinement(t.any(), input => {
  if (!t.string().accepts(input) || !/0x[0-9a-f]{20}/.test(input))
    return 'must be an address string (lower case)';
});

t.AddressString = () => AddressString;
