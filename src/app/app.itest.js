'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const app = require('./app')

const expect = chai.expect;
const given = describe;
const when = describe;

describe('app', () => {
  given('working environment', () => {
    when('running', () => {
      it ('produces transaction tables', () => {
        return expect(app.main()).to.eventually.be.fulfilled;
      });

      xit ('produces tax report table', () => {
        expect(false).to.be.true;
      });
    });
  });
});
