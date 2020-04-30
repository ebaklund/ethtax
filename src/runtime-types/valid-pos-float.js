'use strict';

require('./valid-float');
const t = require('flow-runtime');

const ValidPosFloat = t.refinement(t.ValidFloat(), input => {
  if (input < 0)
    return 'must be real positive number';
});

t.ValidPosFloat = () => ValidPosFloat;
