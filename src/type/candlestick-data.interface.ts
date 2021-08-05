import { CandlestickType } from '../enum';

export interface CandlestickData {
    dateTime: number,
    dateTimeHuman: string,
    open: number,
    high: number,
    low: number,
    close: number,
    type: CandlestickType,
}
