'use static';

const superagent = require('superagent');
const ethers = require('ethers');

const config = require('../../config');
const NestedError = require('../../utils/nested-error');

const etherscanKey = config.keys.etherscan;

async function requestAction(query) {
  const res = await superagent
  .get(query)
  .set('Accept', 'application/json');
  //console.log(res.body.result);
  return res.body.result;
}

async function requestActionTxlist (addr) {
  const query = `http://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanKey}`;
  return requestAction(query);
}

async function requestActionTokentx (addr) {
  const query = `http://api.etherscan.io/api?module=account&action=tokentx&address=${addr}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanKey}`;
  return requestAction(query);
}

function signedValueEth (addr, ethtx) {
  if (ethtx.to.toLowerCase() === addr.toLowerCase())
    return ethtx.value;

  if (ethtx.from.toLowerCase() === addr.toLowerCase())
    return '-' + ethtx.value;

  throw new Error('Failed to calculate signed value');
}

async function getEthRecords (addr) {
  try {
    let acc = ethers.utils.bigNumberify(0);

    return (await requestActionTxlist(addr)).map(t => {
      const rec = {};
      rec.timeStamp = (new Date(Number(t.timeStamp) * 1000)).toISOString();
      rec.symbol = t.tokenSymbol ? t.tokenSymbol : 'ETH';
      rec.value = signedValueEth(addr, t);
      rec.balance = (acc = acc.add(rec.value), acc).toString();

      return rec;
    });
  }
  catch (err) {
    throw new NestedError(err, 'Failed to get ETH records. ' + err.msg);
  }
}

module.exports = {
  getEthRecords,
  requestActionTokentx
};