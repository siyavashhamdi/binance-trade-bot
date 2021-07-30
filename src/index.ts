// eslint-disable-next-line @typescript-eslint/no-var-requires

import { TradeInfo } from './helper/trade';

const bootstrap = async () => {
  const tradeInfoEthBtc = new TradeInfo('ETH', 'BTC');

  const res = await tradeInfoEthBtc.calculate(10, 1);

  console.log({ res });
}

const runner = async () => {
  console.log('Started');
  console.time();

  await bootstrap();

  console.log('Finished');
  console.timeEnd();
}

runner();
