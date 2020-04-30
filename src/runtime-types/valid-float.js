'use strict';

const t = require('flow-runtime');

const ValidFloat = t.refinement(t.number(), input => {
  if (isNaN(input) || !isFinite(input))
    return 'must be real number (no Nan, no Inf)';
});

t.ValidFloat = () => ValidFloat;
