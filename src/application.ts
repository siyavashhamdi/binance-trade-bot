import { TradeInfo } from './helper/trade';
import utils from './helper/utils';

export async function bootstrap() {
    const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });

    setInterval(async () => {
        try {
            await tradeInfoEthBtc.orderPlanA({
                priceToBuy: 0.002,
                desiredProfitPercentage: 0.05,
            })
        } catch (err) {
            utils.log(JSON.stringify({ err }));
        }
    }, 5000);
}
