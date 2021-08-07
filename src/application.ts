import { TradeInfo } from './helper/trade';
import { TradeInfoReverse } from './helper/trade-reverse';
import utils from './helper/utils';
import { std, mean } from 'mathjs';

export async function bootstrap() {
    const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });
    const tradeInfoEthBtcReverse = new TradeInfoReverse('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });

    setInterval(async () => {
        try {
            // await tradeInfoEthBtc.orderPlanA({
            //     priceToBuy: 0.002,
            //     desiredProfitPercentage: 0.05,
            // });

            await tradeInfoEthBtcReverse.orderPlanA({
                priceToSell: 0.002,
                desiredProfitPercentage: 0.05,
            });

        } catch (err) {
            utils.log(JSON.stringify({ err }));
        }
    }, 5000);
}
