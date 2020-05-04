'use strict';

require('./definite-integer');
const t = require('flow-runtime');

const DefinitePosInteger = t.refinement(t.any(), input => {
  if (!t.DefiniteInteger().accepts(input) || input < 0)
    return 'must be a definite positive integer';
});

t.DefinitePosInteger = () => DefinitePosInteger;
