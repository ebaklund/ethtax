'use strict';

require('./definite-number');
const t = require('flow-runtime');

const DefinitePosNumber = t.refinement(t.any(), input => {
  if (!t.DefiniteNumber().accepts(input) || input < 0)
    return 'must be definite positive number';
});

t.DefinitePosNumber = () => DefinitePosNumber;
