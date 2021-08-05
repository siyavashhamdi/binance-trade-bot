import { TradeInfo } from './helper/trade';
import utils from './helper/utils';
import { std } from 'mathjs';

export async function bootstrap() {
    const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });

    setInterval(async () => {
        try {
            // await tradeInfoEthBtc.orderPlanA({
            //     priceToBuy: 0.002,
            //     desiredProfitPercentage: 0.05,
            // })

            const stdx = std([
                Math.abs(0.068751 - 0.068628),
                Math.abs(0.068757 - 0.068637),
                Math.abs(0.068684 - 0.068763),
                Math.abs(0.068739 - 0.068630),
                Math.abs(0.069237 - 0.068721),
            ]);
            utils.log(stdx);

        } catch (err) {
            utils.log(JSON.stringify({ err }));
        }
    }, 5000);
}
