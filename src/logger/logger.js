'use strict';

const sh = require('shelljs');
const path = require('path');

const _filePath = new WeakMap();

class Logger {
  constructor (filePath) {
    _filePath.set(this, filePath);
    sh.rm('-f', filePath);
    sh.mkdir('-p', path.dirname(filePath));
    sh.touch(filePath);
  }

  get filePath () {
    return _filePath.get(this);
  }

  write(str) {
    sh.echo(str).toEnd(this.filePath);
  }
}

module.exports = Logger;
