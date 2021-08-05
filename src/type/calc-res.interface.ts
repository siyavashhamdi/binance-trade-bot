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
