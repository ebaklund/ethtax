'use strict';

const t = require('flow-runtime');

const ValidDate = t.refinement(t.class(Date), input => {
  if (isNaN(input))
    return 'must be valid date';
});

t.ValidDate = () => ValidDate;
