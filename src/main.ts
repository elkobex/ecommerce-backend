require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { TelegramServer } from 'nestjs-telegram-bot';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  // const microservices = app.connectMicroservice({
  //   strategy: new TelegramServer(
  //     '7240720904:AAGEDxkL8ucdMKOB6w5LjiPau0W9vL8aBfA',
  //   ),
  // });

  app.useStaticAssets(join(__dirname, '..', 'src/public'));
  
  app.enableCors();
  await app.listen(3000);
  // Promise.all([microservices.listen(), app.listen(3000)]);
  
}
bootstrap();