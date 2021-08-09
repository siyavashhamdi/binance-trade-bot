import { Telegram } from './helper/telegram';
import { TradeInfo } from './helper/trade';
import { TradeInfoReverse } from './helper/trade-reverse';

import utils from './helper/utils';

export async function bootstrap() {
    const telegram = new Telegram({ token: process.env.TLG_API_TOKEN });
    const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });
    const tradeInfoEthBtcReverse = new TradeInfoReverse('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });

    telegram.startListening();
    telegram.sendBroadcastMessage('Application started.');

    tradeInfoEthBtc.setTelegram(telegram);
    telegram.setTradeInfo(tradeInfoEthBtc);

    setInterval(async () => {
        try {
            await tradeInfoEthBtc.orderPlanA({
                priceToBuy: 0.002,
                desiredProfitPercentage: 0.05,
            });

            await tradeInfoEthBtcReverse.orderPlanA({
                priceToSell: 0.002,
                desiredProfitPercentage: 0.05,
            });
        } catch (err) {
            utils.consoleLog(JSON.stringify({ err }));
        }
    }, 5000);
}
