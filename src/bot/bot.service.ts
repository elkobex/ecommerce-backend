import { Injectable, OnModuleInit} from '@nestjs/common';

@Injectable()
export class BotService implements OnModuleInit {

    onModuleInit() {
        this.botMessage();
    }
    
    botMessage() {        
        process.env.NTBA_FIX_319 = "1";
        const TelegramBot = require('node-telegram-bot-api');
        
        const token = '7240720904:AAGEDxkL8ucdMKOB6w5LjiPau0W9vL8aBfA';
        
        const bot = new TelegramBot(token, { polling: true });
    
        bot.on('message', (msg) => {
            let Hi = "hi";
            if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
                bot.sendMessage(msg.from.id, "Hello " + msg.from.first_name + " what would you like to know about me ?");
            }
        })
    }
}