import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.schema';

@Controller('order')
export class OrdersController {
  constructor(private readonly ordersSrv: OrdersService) {}

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<Order> {
    return this.ordersSrv.getOrderById(id);
  }

  @Post()
  async createOrder(@Body() order: Order): Promise<Order> {
    return this.ordersSrv.createOrder(order);
  }

  @Get('all/:userId')
  async getOrdersByUserId(@Param('userId') userId: string): Promise<Order[]> {
    return this.ordersSrv.getOrdersByUserId(userId);
  }
}
