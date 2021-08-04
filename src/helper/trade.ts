/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import axios from 'axios';
import utils from './utils';

export interface CalcResult {
    baseInfo: {
        date: Date,
        cryptoPair: string,
        desiredProfitPercentage: number,
        investAmountByUsdt: number,
        investAmountByDst: number,
        fees: number,
        breakEvenToSell: number,
    },

    tradeInfo: {
        priceToBuy: number,
        investAmountBySrc: number,
        priceToSell: number,
    },
}

export interface CandlestickData {
    dateTime: number,
    dateTimeHuman: string,
    open: number,
    high: number,
    low: number,
    close: number,
}

export enum CryptoSide {
    source = 'source',
    destination = 'destination',
}

export class TradeInfo {
    constructor(srcCryptoPair: string, dstCryptoPair: string, sideToIncrease: CryptoSide = CryptoSide.destination) {
        this.cryptoPair = {
            complete: `${ srcCryptoPair }${ dstCryptoPair }`,
            src: srcCryptoPair,
            dst: dstCryptoPair,
        }

        this.sideToIncrease = sideToIncrease;

        const Binance = require('node-binance-api');

        console.log(process.env.BNC_API);

        this.binanceApi = new Binance();
        this.binanceApiAuth = new Binance().options({ APIKEY: process.env.BNC_API_KEY, APISECRET: process.env.BNC_API_SECRET });
    }

    private cryptoPair: { complete: string, src: string, dst: string };
    private sideToIncrease: CryptoSide;
    private binanceApi: any;
    private binanceApiAuth: any;

    private async getBestPriceToBuySrc(): Promise<number> {
        // The main algorithm comes here
        const ticker = await this.binanceApi.prices(this.cryptoPair.complete);

        return ticker[this.cryptoPair.complete] * 1;
    }

    private isTimeToBuy(): boolean {
        return true;
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

    public async streamTicker(callback: (candleStickInfo: any) => void) {
        await this.binanceApi.websockets.miniTicker((tickers: any) => {
            const ticker = tickers[this.cryptoPair.complete];

            if (ticker && callback) {
                callback({
                    ...ticker,
                    eventTimeHuman: utils.ts2dt(ticker.eventTime),
                });
            }
        });
    }

    public async getCandlestickHistories(interval = '1m', limit: 10): Promise<Array<CandlestickData>> {
        const url = `https://api.binance.com/api/v3/klines?symbol=${ this.cryptoPair.complete }&interval=${ interval }&limit=${ limit }`;
        const response = await axios.get(url);

        return response.data.map((item: number[]) => ({
            dateTime: item[0],
            dateTimeHuman: utils.ts2dt(item[0]),
            open: +item[1],
            high: +item[2],
            low: +item[3],
            close: +item[4],
        }));
    }

    public async calculate(investAmountByUsdt: number, desiredProfitPercentage: number): Promise<CalcResult> {
        const isTimeToBuy = this.isTimeToBuy();
        utils.log({ SL: 1, isTimeToBuy });

        if (!isTimeToBuy) {
            throw new Error('It is not a good time to buy!');
        }

        // Buy
        const priceToBuy = 0.065405;//await this.getBestPriceToBuySrc();
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

    public async buyMarket(amountBySrc: number): Promise<number> {
        return await this.binanceApiAuth.marketBuy(this.cryptoPair.complete, amountBySrc);
    }

    public async sellLimit(amountBySrc: number, priceToSell: number): Promise<number> {
        return await this.binanceApiAuth.sell(this.cryptoPair.complete, amountBySrc, priceToSell);
    }

    public async test(): Promise<void> {
        // const ticker = await this.binanceApi.prices();
        // const res = ticker[this.cryptoPair.complete] * 1;

        // console.log(res);

        // console.log(this.binanceApi.websockets.miniTicker.toString());

        // await this.binanceApi.websockets.miniTicker((tickers: any) => {
        //     console.log(tickers.BTCUSDT)
        // });
        // return;

        // this.streamTicker((candleStickInfo) => {
        //     console.log(candleStickInfo);
        // });

        // await this.binanceApi.websockets.candlesticks(this.cryptoPair.complete, '1m', (candlestick: any) => {
        //     console.log(candlestick)
        // })

        const res = await this.getCandlestickHistories('1m', 10);
        console.log(res);
    }
}
