'use strict';

const _exchange = new WeakMap;
const _symbol = new WeakMap;
const _action = new WeakMap;
const _date = new WeakMap;
const _tokValue = new WeakMap;
const _tokBalance = new WeakMap;
const _usdValue = new WeakMap;
const _usdBalance = new WeakMap;
const _nokValue = new WeakMap;
const _nokBalance = new WeakMap;

class TransactionRecord {
  constructor (exchange, symbol, action, date, tokValue, tokBalance, usdValue, usdBalance, nokValue, nokBalance) {
    if (typeof exchange !== 'string')
      throw new TypeError('exchange argument is not a string type');

    if (typeof symbol !== 'string')
      throw new TypeError('symbol argument is not a string type');

    if (typeof action !== 'string')
      throw new TypeError('action argument is not a string type');

    if (!date instanceof Date)
      throw new TypeError('date argument is not a Date type');

    if (typeof tokValue !== 'number')
      throw new TypeError('tokValue argument is not a number type');

    if (typeof tokBalance !== 'number')
      throw new TypeError('tokBalance argument is not a number type');

    if (typeof usdValue !== 'number')
      throw new TypeError('usdValue argument is not a number type');

    if (typeof usdBalance !== 'number')
      throw new TypeError('usdBalance argument is not a number type');

    if (typeof nokValue !== 'number')
      throw new TypeError('nokValue argument is not a number type');

    if (typeof nokBalance !== 'number')
      throw new TypeError('nokBalance argument is not a number type');

    _exchange.set(this, exchange);
    _symbol.set(this, symbol);
    _action.set(this, action);
    _date.set(this, date);
    _tokValue.set(this, tokValue);
    _tokBalance .set(this, tokBalance);
    _usdValue.set(this, usdValue);
    _usdBalance.set(this, usdBalance);
    _nokValue.set(this, nokValue);
    _nokBalance.set(this, nokBalance);
  }

  get exchange () { return _exchange.get(this); }
  get symbol () { return _symbol.get(this); }
  get action () { return _action.get(this); }
  get date () { return _date.get(this); }
  get tok () { return { value: _tokValue.get(this), balance: _tokBalance.get(this) }; }
  get usd () { return { value: _usdValue.get(this), balance: _usdBalance.get(this) }; }
  get nok () { return { value: _nokValue.get(this), balance: _nokBalance.get(this) }; }
}

module.exports = TransactionRecord;
