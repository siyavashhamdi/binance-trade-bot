import axios from 'axios';
import { std } from 'mathjs';
import utils from './utils';
import { CalcResult, TradenfoOptions, CandlestickData } from '../type';
import { CryptoSide, CandlestickType } from '../enum';

export class TradeInfo {
    constructor(srcCryptoPair: string, dstCryptoPair: string, options: TradenfoOptions) {
        this.cryptoPair = {
            complete: `${ srcCryptoPair }${ dstCryptoPair }`,
            src: srcCryptoPair,
            dst: dstCryptoPair,
        }

        this.options = {
            ...options,
            cryptoSide: options.cryptoSide || CryptoSide.destination,
        };

        const Binance = require('node-binance-api');

        this.binanceApi = new Binance();
        this.binanceApiAuth = new Binance().options({ APIKEY: this.options.apiKey, APISECRET: this.options.apiSecret });

        this.nextCheckBuy = new Date();
    }

    private cryptoPair: { complete: string, src: string, dst: string };
    private options: TradenfoOptions;

    private binanceApi: any;
    private binanceApiAuth: any;

    private nextCheckBuy: Date;

    private async getBestPriceToBuySrc(): Promise<number> {
        // The main algorithm comes here
        const ticker = await this.binanceApi.prices(this.cryptoPair.complete);

        return ticker[this.cryptoPair.complete] * 1;
    }

    private async checkTimeToBuy(samplingCount = 5): Promise<{ isRightTime: boolean, errMsg?: string }> {
        // test - temp to delete
        const csHistoriesX = await this.getCandlestickHistories('5m', samplingCount);
        const candlestickHightsX = csHistoriesX.map(item => Math.abs(item.high - item.low));
        const stdValX = std(candlestickHightsX);
        utils.log(`STD: ${ stdValX }`);

        const isTimeReached = this.nextCheckBuy < new Date();

        if (!isTimeReached) {
            return {
                isRightTime: false,
                errMsg: `Time is not reached: ${ utils.formatDateTime(this.nextCheckBuy) } < ${ utils.formatDateTime(new Date()) }`,
            };
        }

        const SamplingCount80Percent = samplingCount * 0.8;
        const csHistories = await this.getCandlestickHistories('5m', samplingCount);
        const bullishCount = csHistories.filter(item => item.type === CandlestickType.bullish).length;

        // At least 80% of sampling must be bullish
        if (bullishCount < SamplingCount80Percent) {
            return {
                isRightTime: false,
                errMsg: `Sampling count is not satisfied: ${ bullishCount } < ${ SamplingCount80Percent }`,
            };
        }

        const isBearishFoundInLasts =
            csHistories[samplingCount - 2].type === CandlestickType.bearish ||
            csHistories[samplingCount - 1].type === CandlestickType.bearish;

        if (isBearishFoundInLasts) {
            return {
                isRightTime: false,
                errMsg: 'Bearish found in last candlesticks!',
            };
        }

        // const candlestickHights = csHistories.map(item => Math.abs(item.high - item.low));
        // const stdVal = std(candlestickHights);

        // if (stdVal > 50) {
        //     return {
        //         isRightTime: false,
        //         errMsg: `Standard deviation is high. Current STD is ${ stdVal }`,
        //     };
        // }

        return {
            isRightTime: true,
        };
    }

    private async convertUsdt2Src(amountByUsdt: number): Promise<number> {
        const ticker = await this.binanceApi.prices();
        const srcUsdtPair = `${ this.cryptoPair.src }USDT`;
        const currSrcUsdtPrice = ticker[srcUsdtPair];

        return amountByUsdt / currSrcUsdtPrice;
    }

    private async convertUsdt2Dst(amountByUsdt: number): Promise<number> {
        if (this.cryptoPair.dst === 'USDT') {
            return amountByUsdt;
        }

        const ticker = await this.binanceApi.prices();
        const dstUsdtPair = `${ this.cryptoPair.dst }USDT`;
        const currDstUsdtPrice = ticker[dstUsdtPair];

        return amountByUsdt / currDstUsdtPrice;
    }

    private calcFee(investAmountByDst: number, desiredProfitPercentage: number): number {
        const buyFee = investAmountByDst * 0.00075;

        const percentageCoeff = 1 + (desiredProfitPercentage / 100);
        const sellFee = investAmountByDst * percentageCoeff * 0.00075;

        return buyFee + sellFee;
    }

    private calcSellBreakEven(priceToBuy: number, fees: number, investAmountByDst: number) {
        return priceToBuy + ((fees * priceToBuy) / investAmountByDst);
    }

    private calcSellSrcPrice(breakEvenToSell: number, desiredProfitPercentage: number) {
        const percentageCoeff = 1 + (desiredProfitPercentage / 100);
        return breakEvenToSell * percentageCoeff;
    }

    private async streamTicker(callback: (candleStickInfo: any) => void) {
        await this.binanceApi.websockets.miniTicker((tickers: any) => {
            const ticker = tickers[this.cryptoPair.complete];

            if (ticker && callback) {
                callback({
                    ...ticker,
                    eventTimeHuman: utils.formatDateTime(ticker.eventTime),
                });
            }
        });
    }

    private async getCandlestickHistories(interval = '1m', limit = 10): Promise<Array<CandlestickData>> {
        const url = `https://api.binance.com/api/v3/klines?symbol=${ this.cryptoPair.complete }&interval=${ interval }&limit=${ limit }`;
        const response = await axios.get(url);

        return response.data.map((item: number[]) => ({
            dateTime: item[0],
            dateTimeHuman: utils.formatDateTime(item[0]),
            open: +item[1],
            high: +item[2],
            low: +item[3],
            close: +item[4],
            type: (+item[1]) - (+item[4]) <= 0 ? CandlestickType.bullish : CandlestickType.bearish,
        }));
    }

    private async buyMarket(amountBySrc: number) {
        return await this.binanceApiAuth.marketBuy(this.cryptoPair.complete, amountBySrc);
    }

    private async sellLimit(amountBySrc: number, priceToSell: number) {
        const fixedNum = 6;

        return await this.binanceApiAuth.sell(this.cryptoPair.complete, amountBySrc, priceToSell.toFixed(fixedNum));
    }

    public async orderInstantBuySell(investAmountByUsdt: number, desiredProfitPercentage: number): Promise<CalcResult> {
        const timeToBuyStatus = await this.checkTimeToBuy();

        if (!timeToBuyStatus.isRightTime) {
            throw new Error(timeToBuyStatus.errMsg);
        }

        // Buy
        const priceToBuy = await this.getBestPriceToBuySrc();
        const investAmountBySrc = await this.convertUsdt2Src(investAmountByUsdt);
        const investAmountByDst = await this.convertUsdt2Dst(investAmountByUsdt);

        // Sell
        const fees = this.calcFee(investAmountByDst, desiredProfitPercentage);
        const breakEvenToSell = this.calcSellBreakEven(priceToBuy, fees, investAmountByDst);
        const priceToSell = this.calcSellSrcPrice(breakEvenToSell, desiredProfitPercentage);

        return {
            baseInfo: {
                date: new Date(),
                cryptoPair: this.cryptoPair.complete,
                desiredProfitPercentage,
                investAmountByUsdt,
                investAmountByDst,
                fees,
                breakEvenToSell,
            },

            tradeInfo: {
                priceToBuy,
                investAmountBySrc,
                priceToSell,
            },
        };
    }

    public async orderPlanA(objInput: any): Promise<void> {
        const timeToBuyStatus = await this.checkTimeToBuy();

        if (!timeToBuyStatus.isRightTime) {
            utils.log(`Not a right time to buy. Msg: ${ timeToBuyStatus.errMsg }`);
            return;
        }

        this.nextCheckBuy = utils.addSecondsToDate(new Date(), 6 * 60);  // The next buy/sell after at least 6 minutes

        const resBuy = await this.buyMarket(objInput.priceToBuy);

        utils.log(`Market buy done on price ${ resBuy.fills[0].price }${ this.cryptoPair.dst } with amount ${ resBuy.cummulativeQuoteQty }${ this.cryptoPair.src }`);

        if (resBuy?.status === 'FILLED') {
            // Buy
            const priceToBuy = +resBuy.fills[0].price;
            const investAmountByDst = +resBuy.cummulativeQuoteQty;

            // Sell
            const fees = this.calcFee(investAmountByDst, objInput.desiredProfitPercentage);
            const breakEvenToSell = this.calcSellBreakEven(priceToBuy, fees, investAmountByDst);
            const priceToSell = this.calcSellSrcPrice(breakEvenToSell, objInput.desiredProfitPercentage);

            const resSell = await this.sellLimit(objInput.priceToBuy, priceToSell);

            utils.log(`Sell order created on price ${ priceToBuy }${ this.cryptoPair.dst } with amount ${ investAmountByDst }${ this.cryptoPair.src }`);
        } else {
            utils.log('Buy status is not Filled!');
        }
    }
}
