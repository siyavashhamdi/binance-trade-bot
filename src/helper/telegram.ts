import { TelegramCommands } from '../enum';
import { TelegramBotOptions } from '../type';

export class Telegram {
    constructor(options: TelegramBotOptions) {
        const TelegramBot = require('node-telegram-bot-api');

        if (!options.token || options.token === '') {
            throw new Error('No token found for Telegram Bot in config env file');
        }

        this.options = { ...options };
        this.telegramBot = new TelegramBot(this.options.token, { polling: true });
    }

    private telegramBot: any;
    private options: TelegramBotOptions;

    public startListening(): void {
        this.telegramBot.onText(/\/(.+)/, (msg: any, match: any) => {
            const command = match[1] as TelegramCommands;
            const chatId = msg.chat.id;

            switch (command) {
                case TelegramCommands.salam: {
                    this.sendMessage(chatId, 'Salam');
                    break;
                };

                case TelegramCommands.id: {
                    const resp = `Your chat id is: ${ chatId }`;

                    this.sendMessage(chatId, resp);
                    break;
                };

                default: {
                    this.sendMessage(chatId, 'Command is not valid!');
                    break;
                };
            }
        });
    }

    public sendBroadcastMessage(msg: string) {
        const chatIds = process.env.TLG_CHAT_IDS?.split(',').map(item => +item) ?? [];

        for (const chatId of chatIds) {
            this.sendMessage(chatId, msg);
        }
    }

    public sendMessage(chatId: number, msg: string) {
        this.telegramBot.sendMessage(chatId, msg);
    }
}