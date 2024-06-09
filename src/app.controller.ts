import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { BotService } from './bot/bot.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService /*, private botService:BotService*/) {}

  // @MessagePattern('message')
  // async handler(data) {
  //   return this.appService.handler(data);
  // }

  // @Get()
  // getBotDialog(@Res() res) {
  //   this.botService.botMessage();
  //   res.status(HttpStatus.OK).send("Bot service started");
  // }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
