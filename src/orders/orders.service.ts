import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrdersService {
  constructor(@InjectModel('order') private orderModel: Model<OrderDocument>) {}

  async getOrderById(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }
  
  async createOrder(order: Order): Promise<Order> {
    const newOrder = new this.orderModel(order);
    return newOrder.save();
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).exec();
  }
}
