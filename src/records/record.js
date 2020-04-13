'use strict';

const t = require('flow-runtime');

const _exchange = new WeakMap;
const _symbol = new WeakMap;
const _action = new WeakMap;
const _date = new WeakMap;
const _tokValue = new WeakMap;
const _tokBalance = new WeakMap;
const _usdTokRate = new WeakMap;
const _usdValue = new WeakMap;
const _usdBalance = new WeakMap;
const _nokUsdRate = new WeakMap;
const _nokValue = new WeakMap;
const _nokBalance = new WeakMap;

class TransactionRecord {
  constructor (exchange, symbol, action, date, tokValue, tokBalance, usdTokRate, usdValue, usdBalance, nokUsdRate, nokValue, nokBalance) {
    t.string().assert(exchange);
    t.string().assert(symbol);
    t.string().assert(action);
    t.class(Date).assert(date);
    t.number().assert(tokValue);
    t.number().assert(tokBalance);
    t.number().assert(usdTokRate);
    t.number().assert(usdValue);
    t.number().assert(usdBalance);
    t.number().assert(nokUsdRate);
    t.number().assert(nokValue);
    t.number().assert(nokBalance);

    _exchange.set(this, exchange);
    _symbol.set(this, symbol);
    _action.set(this, action);
    _date.set(this, date);
    _tokValue.set(this, tokValue);
    _tokBalance .set(this, tokBalance);
    _usdTokRate.set(this, usdTokRate);
    _usdValue.set(this, usdValue);
    _usdBalance.set(this, usdBalance);
    _nokUsdRate.set(this, nokUsdRate);
    _nokValue.set(this, nokValue);
    _nokBalance.set(this, nokBalance);
  }

  get exchange () { return _exchange.get(this); }
  get symbol () { return _symbol.get(this); }
  get action () { return _action.get(this); }
  get date () { return _date.get(this); }
  get tok () { return { value: _tokValue.get(this), balance: _tokBalance.get(this) }; }
  get usd () { return { usdTokRate: _usdTokRate.get(this), value: _usdValue.get(this), balance: _usdBalance.get(this) }; }
  get nok () { return { nokUsdRate: _nokUsdRate.get(this), value: _nokValue.get(this), balance: _nokBalance.get(this) }; }
}

module.exports = TransactionRecord;
