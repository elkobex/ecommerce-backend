import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrdersModule } from './orders/orders.module';

// dacotaperriert@gmail.com
// mdemierda023

// dacotaperriert@gmail.com
// mdemierda023

// dacotaperriert
// fjvDprtodDwZGyYt


@Module({
  imports: [
    // mongodb+srv://dacotaperriert:fjvDprtodDwZGyYt@ecommerce.yfvcx9i.mongodb.net/ecommerce
    // mongodb://0.0.0.0:27017/ecommerce
    MongooseModule.forRoot('mongodb+srv://dacotaperriert:fjvDprtodDwZGyYt@ecommerce.yfvcx9i.mongodb.net/ecommerce'), 
    // TelegramClient.forRootAsync({
    //   inject: [],
    //   useFactory: async () => ({
    //     token: '7240720904:AAGEDxkL8ucdMKOB6w5LjiPau0W9vL8aBfA',
    //   }),
    // }),
    ProductsModule, 
    UsersModule,
    OrdersModule,
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '..', 'src', 'public'),
      rootPath: join(__dirname, '..', 'src/public'),
    }),
    // OrdersModule,
    // TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
