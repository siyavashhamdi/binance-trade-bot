/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

export interface CalcResult {
    date: Date,
    cryptoPair: string,
    investAmountByUsdt: number,
    investAmountBySrc: number,
    priceToBuy: number,
    breakEvenToSell: number,
    priceToSell: number,
}

export class TradeInfo {
    constructor(srcCryptoPair: string, dstCryptoParir: string) {
        this.cryptoPair = {
            complete: `${ srcCryptoPair }${ dstCryptoParir }`,
            src: this.srcCryptoPair = srcCryptoPair,
            dst: this.dstCryptoPair = dstCryptoParir,
        }

        const Binance = require('node-binance-api');
        this.binanceApi = new Binance();
    }

    private cryptoPair: { complete: string, src: string, dst: string };
    private srcCryptoPair: string;
    private dstCryptoPair: string;
    private binanceApi: any;

    private async getBestPriceToBuySrc(): Promise<number> {
        // The main algorithm comes here
        const ticker = await this.binanceApi.prices();

        return ticker[this.cryptoPair.complete] * 1;
    }

    private isTimeToBuy(): boolean {
        return true;
    }

    private async convertUsdt2Src(amountByUsdt: number): Promise<number> {
        const ticker = await this.binanceApi.prices();
        const srcUsdtPair = `${ this.srcCryptoPair }USDT`;
        const currSrcUsdtPrice = ticker[srcUsdtPair];

        return amountByUsdt / currSrcUsdtPrice;
    }

    private calcFee(priceToBuy: number): number {
        return priceToBuy * 0.00075 * 2;
    }

    private calcSellBreakEven(priceToBuy: number) {
        const fee = this.calcFee(priceToBuy);

        console.log({ SL: 2, priceToBuy, fee });

        return priceToBuy - fee;
    }

    private calcSellSrcPrice(breakEvenToSell: number, desiredProfitPercentage: number) {
        const percentageCoeff = 1 - (desiredProfitPercentage / 100);

        return breakEvenToSell * percentageCoeff;
    }

    public async calculate(investAmountByUsdt: number, desiredProfitPercentage: number): Promise<CalcResult> {
        // Buy
        const isTimeToBuy = this.isTimeToBuy();
        console.log({ SL: 1, isTimeToBuy });

        if (!isTimeToBuy) {
            throw new Error('It is not a good time to buy!');
        }

        const investAmountBySrc = await this.convertUsdt2Src(investAmountByUsdt);
        const priceToBuy = await this.getBestPriceToBuySrc();

        // Sell
        const breakEvenToSell = this.calcSellBreakEven(priceToBuy);
        const priceToSell = this.calcSellSrcPrice(breakEvenToSell, desiredProfitPercentage);

        return {
            date: new Date(),
            cryptoPair: this.cryptoPair.complete,
            investAmountByUsdt,
            investAmountBySrc,
            priceToBuy,
            breakEvenToSell,
            priceToSell,
        };
    }
}
