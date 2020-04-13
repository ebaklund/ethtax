'use strict';

const TransactionRecord = require('./record');


class TransactionRecordBuilder {

  withExchange(exchange) { this.exchange = exchange; }
  withSymbol(symbol) { this.symbol = symbol; }
  withAction(action) { this.action = action; }
  withDate(date) { this.date = date; }
  withTokValue(tokValue) { this.tokValue = tokValue; }
  withTokBalance(tokBalance) { this.tokBalance = tokBalance; }
  withUsdTokRate(usdTokRate) { this.usdTokRate = usdTokRate; }
  withUsdValue(usdValue) { this.usdValue = usdValue; }
  withUsdBalance(usdBalance) { this.usdBalance = usdBalance; }
  withNokUsdRate(nokUsdRate) { this.nokUsdRate = nokUsdRate; }
  withNokValue(nokValue) { this.nokValue = nokValue; }
  withNokBalance(nokBalance) { this.nokBalance = nokBalance; }

  build () {
    return new TransactionRecord(
      this.exchange, this.symbol, this.action, this.date,
      this.tokValue, this.tokBalance,
      this.usdTokRate, this.usdValue, this.usdBalance,
      this.nokUsdRate, this.nokValue, this.nokBalance
    );
  }
}

module.exports = TransactionRecordBuilder;
