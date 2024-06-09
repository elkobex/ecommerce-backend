import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
// import { TelegramBotModule } from 'src/telegram/telegram.module';
import { TelegramBotService } from './telegram.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      {
        name: 'user',
        schema: UserSchema
      }
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, TelegramBotService]
})
export class UsersModule {}