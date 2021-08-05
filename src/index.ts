/* eslint-disable no-constant-condition */
// eslint-disable-next-line @typescript-eslint/no-var-requires

import dotenv from 'dotenv';
import { bootstrap } from './application';

dotenv.config({ path: 'src/config/.env' });

bootstrap();
