import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'order',
        schema: OrderSchema
      }
    ])
  ],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule {}
