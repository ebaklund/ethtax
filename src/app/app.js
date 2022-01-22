'use strict';

const config = require('./config');
const NestedError = require('../utils/nested-error');
const Logger = require('../utils/logger');

let keepaliveExitPromise;

process.on('unhandledRejection', (err /*, promise*/) => {
  console.log('\n\nError: ' + NestedError.asStringified(err));
  keepaliveExitPromise = new Promise((resolve, reject) => setTimeout(() => process.exit(0), 1000));
  throw err;
});

// MAIN

async function main () {
  const YYYY = process.argv[2];
  console.info('Taxation year: ', YYYY)

  if (! /20[0-9][0-9]/.test(YYYY)) {
    console.error(`Illegal input argument: \"${YYYY}\". Expected year of taxation in format: \"YYYY\".`)
    console.error(`Usage:`)
    console.error(` $ cd ${process.argv[1]}`)
    console.error(` $ node . <YYYY>`)
    return;
  }

  const version = 'v1';
  //const filePath = `/data/home/erik/googledrive/Erik/Skatt/${YYYY}/Kryptovaluta-${version}.csv`;
  const filePath = `./Skatt/${YYYY}/Kryptovaluta-${YYYY}-${version}.csv`;

  const presenter = require('../workflows/transaction-table-presenter');
  const december = 11; // zero base
  const date = new Date(YYYY, december, 31, 23, 55);

  await presenter.showTransactions(date);
  await presenter.showTaxReport(date);
}

module.exports = {
  main
};
