// eslint-disable-next-line @typescript-eslint/no-var-requires

import { TradeInfo } from './helper/trade';

const bootstrap = async () => {
  const tradeInfo = new TradeInfo('ETH', 'BTC');

  const res = await tradeInfo.calculate(12, 1);

  console.log({ res });
}

bootstrap();
