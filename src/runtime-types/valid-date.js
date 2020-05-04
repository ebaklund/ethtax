'use strict';

const t = require('flow-runtime');

const ValidDate = t.refinement(t.any(), input => {
  if (!t.class(Date) || isNaN(input))
    return 'must be valid date';
});

t.ValidDate = () => ValidDate;
