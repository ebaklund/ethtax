'use strict';

const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const NestedError = require('./nested-error');

function throwNestedErrorWith(innerError) {
  try {
    throw innerError;
  }
  catch (innerErr) {
    throw new NestedError(innerErr, 'Outer error');
  }
}

describe('class NestedError', () => {

  describe('#asStringified()', () => {
    let parsedErr;

    before(() => {
      try {
        const innerErr = new Error('Inner error with code');
        innerErr.code = 404;
        throwNestedErrorWith(innerErr);
      }
      catch (err) {
        parsedErr = JSON.parse(err.asStringified());
      }
    });

    it('has #message', () => {
      expect(parsedErr.message).to.equal('Outer error');
    });

    it('has #stack', () => {
      expect(parsedErr.stack).to.exist;
    });

    it('has #innerError', () => {
      expect(parsedErr.innerError).to.exist;
    });

    it('has #innerError.message', () => {
      expect(parsedErr.innerError.message).to.equal('Inner error with code');
    });

    it('has #innerError.code', () => {
      expect(parsedErr.innerError.code).to.equal(404);
    });

    it('has #innerError.stack', () => {
      expect(parsedErr.innerError.stack).to.exist;
    });
  });

  describe('new NestedError(Error)', () => {
    let nestedErr;

    beforeEach(() => {
      try {
        const innerErr = new Error('Inner error with code');
        innerErr.code = 404;
        throwNestedErrorWith(innerErr);
      }
      catch (err) {
        nestedErr = err;
      }
    });

    it('has #message', () => {
      expect(nestedErr.message).to.equal('Outer error');
    });

    it('has #stack', () => {
      expect(nestedErr.stack).to.exist;
    });

    it('has #innerError', () => {
      expect(nestedErr.innerError).to.exist;
    });

    it('has #innerError.message', () => {
      expect(nestedErr.innerError.message).to.equal('Inner error with code');
    });

    it('has #innerError.code', () => {
      expect(nestedErr.innerError.code).to.equal(404);
    });

    it('has #innerError.stack', () => {
      expect(nestedErr.innerError.stack).to.exist;
    });

    it('has #asStringified()', () => {
      expect(nestedErr.asStringified).to.be.a('function');
    });
  });

  describe('new NestedError(string)', () => {
    let nestedErr;

    before(() => {
      try {
        throwNestedErrorWith('Inner error which is a string');
      }
      catch (err) {
        nestedErr = err;
      }
    });

    it('has #message', () => {
      expect(nestedErr.message).to.equal('Outer error');
    });

    it('has #stack', () => {
      expect(nestedErr.stack).to.exist;
    });

    it('has #innerError', () => {
      expect(nestedErr.innerError).to.equal('Inner error which is a string');
    });

    it('has #asStringified()', () => {
      expect(nestedErr.asStringified).to.be.a('function');
    });
  });
});
