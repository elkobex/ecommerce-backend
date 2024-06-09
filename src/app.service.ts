import { Injectable } from '@nestjs/common';
// import { TelegramService } from 'nestjs-telegram-bot';

@Injectable()
export class AppService {

  constructor(/*private readonly telegram: TelegramService*/) {
  }
  
  getHello(): string {
    return 'Hello World!';
  }

  // handler(msg: any) {
  //   if (msg.text === '/start') {
  //     this.telegram.sendMessage(msg.chat.id, 'Hello, ' + msg.from.first_name);
  //   }
  // }
}
