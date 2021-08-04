/* eslint-disable no-constant-condition */
// eslint-disable-next-line @typescript-eslint/no-var-requires

import { TradeInfo } from './helper/trade';
import utils from './helper/utils';
import dotenv from 'dotenv';

const bootstrap = async () => {
  dotenv.config({ path: 'src/config/.env' });

  const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC');
  let tryNum = 0;

  while (true) {
    try {
      utils.log(`Try #${ ++tryNum }`);

      // const res = await tradeInfoEthBtc.calculate(5.2, 0.05);
      // utils.log({ res });

      console.log(process.env.BNC_API);

      // await tradeInfoEthBtc.test();
      break;
    } catch (err) {
      utils.log(`ERROR!\n${ err }`);
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
