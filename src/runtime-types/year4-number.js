'use strict';

const t = require('flow-runtime');

const Year4 = t.refinement(t.any(), input => {
  if ((!Number.isInteger(input)) || (input < 1970) || (input > 9999))
    return 'must be year number (YYYY)';
});

t.Year4 = () => Year4;
