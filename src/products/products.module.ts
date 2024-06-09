import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './producto.schema';
import { ColorModelSchema } from './color-model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'product',
        schema: ProductSchema
      },
      {
        name: 'colorModel',
        schema: ColorModelSchema
      }
    ])
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
