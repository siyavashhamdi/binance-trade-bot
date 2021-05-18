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

    let samplingPrice = [];
    let nextMin = null;
    let isMinStartedFromZero = false;
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

        const [formattedTime, dtMultiPart] = timestamp2time(candlesticks.E);
        const highMinusLow = candlesticks.k.h - candlesticks.k.l;

        if (nextMin === null) {
            nextMin = dtMultiPart.m + 1;
        }

        if (nextMin >= 60) {
            nextMin = 0;
        }

        if (dtMultiPart.m === nextMin) {
            nextMin = dtMultiPart.m + 1;
            samplingPrice = [];
            isMinStartedFromZero = true;
        }

        samplingPrice.push(candlesticks.k.c);

        console.error({
            formattedTime,
            price: candlesticks.k.c,
            cnt: samplingPrice.length,
            avg: _.meanBy(samplingPrice, r => r * 1),
            isMinStartedFromZero,
            nextMin,
            highMinusLow,
        });
    });

    const timestamp2time = (unix_timestamp) => {
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        const date = new Date(unix_timestamp);

        const y = date.getFullYear();
        const M = date.getMonth() + 1;
        const d = date.getDate();
        const H = date.getHours();
        const m = date.getMinutes();
        const s = date.getSeconds();
        const ms = date.getMilliseconds();

        // Will display time in 10:30:23 format
        const formattedTime = `${ y }/${ M }/${ d }-${ H }:${ m }:${ s }.${ ms }`;
        const dtMultiPart = { y, M, d, H, m, s, ms };

        return [formattedTime, dtMultiPart];
    }
}

bootstrap();
