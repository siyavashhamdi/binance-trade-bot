/* eslint-disable no-constant-condition */
// eslint-disable-next-line @typescript-eslint/no-var-requires

import { CryptoSide, TradeInfo } from './helper/trade';
import utils from './helper/utils';
import dotenv from 'dotenv';

const bootstrap = async () => {
  dotenv.config({ path: 'src/config/.env' });

  const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC', { apiKey: process.env.BNC_API_KEY, apiSecret: process.env.BNC_API_SECRET });
  let tryNum = 0;

  while (true) {
    try {
      utils.log(`Try #${ ++tryNum }`);

      await tradeInfoEthBtc.test({
        priceToBuy: 0.002,
        desiredProfitPercentage: 0.02,
      });

      break;
    } catch (err) {
      utils.log(`ERROR!\n${ JSON.stringify({ err }) }`);
    }
  }
}

const runner = async () => {
  utils.log('Started');
  console.time();

  await bootstrap();

  utils.log('Finished');
  console.timeEnd();
}

runner();
