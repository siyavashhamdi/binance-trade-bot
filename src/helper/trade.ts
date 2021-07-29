/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

export interface CalcResult {
    date: Date,
    t1: number,
}

export class TradeInfo {
    constructor(srcCryptoPair: string, dstCryptoParir: string) {
        this.cryptoPair = {
            complete: `${ srcCryptoPair }${ dstCryptoParir }`,
            source: this.srcCryptoPair = srcCryptoPair,
            destination: this.dstCryptoPair = dstCryptoParir,
        }

        const Binance = require('node-binance-api');
        this.binanceApi = new Binance();
    }

    private cryptoPair: {
        complete: string,
        source: string,
        destination: string,
    };
    private srcCryptoPair: string;
    private dstCryptoPair: string;
    private binanceApi: any;

    private async getBestPriceToBuySource(): Promise<number> {
        const ticker = await this.binanceApi.prices();

        return ticker[this.cryptoPair.complete];
    }

    private calcFee(priceToBuy: number): number {
        return priceToBuy * 2;
    }

    private calcBreakEven(priceToBuy: number) {
        return priceToBuy;
    }

    private calcSellSourcePrice(priceToBuy: number) {
        return priceToBuy;
    }

    public async calculate(investAmountByDollar: number, desiredProfitPercentage: number): Promise<CalcResult> {
        // Convert Dollar to Src

        return {
            date: new Date(),
            t1: await this.getBestPriceToBuySource(),
        } as CalcResult;
    }
}
