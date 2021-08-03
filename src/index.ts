/* eslint-disable no-constant-condition */
// eslint-disable-next-line @typescript-eslint/no-var-requires

import { TradeInfo } from './helper/trade';
import utils from './helper/utils';

const bootstrap = async () => {
  const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC');
  let tryNum = 0;

  while (true) {
    try {
      utils.log(`Try #${ ++tryNum }`);

      // const res = await tradeInfoEthBtc.calculate(10, 0.2);
      // utils.log({ res });

      await tradeInfoEthBtc.test();
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
