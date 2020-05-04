'use strict';

require('./definite-number');
const t = require('flow-runtime');

const DefiniteInteger = t.refinement(t.any(), input => {
  if (!t.DefiniteNumber().accepts(input) || !Number.isInteger(input))
    return 'must be a definite integer';
});

t.DefiniteInteger = () => DefiniteInteger;
