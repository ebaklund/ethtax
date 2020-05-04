'use strict';

const t = require('flow-runtime');

const DefiniteNumber = t.refinement(t.any(), input => {
  if (!t.number().accepts(input) || isNaN(input) || !isFinite(input))
    return 'must be a definite number (no Nan, no Inf)';
});

t.DefiniteNumber = () => DefiniteNumber;
