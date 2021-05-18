const bootstrap = async () => {
    const Binance = require('node-binance-api');
    const _ = require('lodash');

    const binance = new Binance().options({
        APIKEY: 'e4VwFPnXZ2yrffp28OrPIZYZTeG6Zpe8K795M0xaoDWdHiH2IXg4LRrtG9sr4opL',
        APISECRET: 'DWU1tonrjTTmjpYxsBfU2W0efh0QtuZmOsc4SwQlAl1fyUKMCEquGP4PC6JQD6KL'
    });

    // let ticker = await binance.prices();
    // console.info(`Price of BNB: ${ticker.BNBUSDT}`);

    // binance.balance((error, balances) => {
    //     if (error) return console.error(error);
    //     console.info("balances()", balances);
    //     console.info("ETH balance: ", balances.ETH.available);
    // });

    // binance.bookTickers('BNBBTC', (error, ticker) => {
    //     console.info("bookTickers", ticker);
    // });

    // binance.trades("ETHUSDT", (error, trades, symbol) => {
    //     console.info(symbol + " trade history", trades);
    // });

    // let quantity = 10, price = 2;
    // binance.sell("USDCUSDT", quantity, price, { type: 'LIMIT' }, (error, response) => {
    //     console.log({ error });
    //     console.info("Limit Buy response", response);
    //     console.info("order id: " + response.orderId);
    // });

    // binance.prevDay(false, (error, prevDay) => {
    //     // console.info(prevDay); // view all data
    //     for (let obj of prevDay) {
    //         let symbol = obj.symbol;
    //         console.info(symbol + " volume:" + obj.volume + " change: " + obj.priceChangePercent + "%");
    //     }
    // });

    const res = [];
    binance.websockets.candlesticks(['DOGEUSDT'], "1m", (candlesticks) => {
        // let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        // let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        // console.info(symbol + " " + interval + " candlestick update");
        // console.info("open: " + open);
        // console.info("high: " + high);
        // console.info("low: " + low);
        // console.info("close: " + close);
        // console.info("volume: " + volume);
        // console.info("isFinal: " + isFinal);

        res.push(candlesticks.k.c);

        if (res.length > 10)
            res.shift();

        console.error({ [timestamp2time(candlesticks.E)]: candlesticks.k.c, avg: _.meanBy(res, r => r * 1) });

    });

    const timestamp2time = (unix_timestamp) => {
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        var date = new Date(unix_timestamp);

        var y = date.getFullYear();
        var M = date.getMonth() + 1;
        var d = date.getDate();
        var H = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();
        var ms = date.getMilliseconds();

        // Will display time in 10:30:23 format
        var formattedTime = `${y}/${M}/${d}-${H}:${m}:${s}.${ms}`;

        return formattedTime;
    }
}

bootstrap();
