'use strict';

const TransactionRecord = require('./record');


class TransactionRecordBuilder {

  withExchange(exchange) { this.exchange = exchange; }
  withSymbol(symbol) { this.symbol = symbol; }
  withAction(action) { this.action = action; }
  withDate(date) { this.date = date; }
  withTokValue(tokValue) { this.tokValue = tokValue; }
  withTokBalance(tokBalance) { this.tokBalance = tokBalance; }
  withUsdValue(usdValue) { this.usdValue = usdValue; }
  withUsdBalance(usdBalance) { this.usdBalance = usdBalance; }
  withNokValue(nokValue) { this.nokValue = nokValue; }
  withNokBalance(nokBalance) { this.nokBalance = nokBalance; }

  build () {
    return new TransactionRecord(
      this.exchange, this.symbol, this.action, this.date,
      this.tokValue, this.tokBalance,
      this.usdValue, this.usdBalance,
      this.nokValue, this.nokBalance
    );
  }
}

module.exports = TransactionRecordBuilder;
