import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export class Location {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;
}

export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: {
    id: number;
    identifier: string;
    name: string;
    imageUrl: string;
    category: string;
    price: number;
    originalPrice: number;
    sizes?: string[];
    size?: string | null;
    color?: { id: string; title: string; imagen: string } | null;
  };

  @Prop({ required: true })
  quantity: number;
}

@Schema()
export class Order {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: false })
  fullName: string;

  @Prop({ required: false })
  cardType: string;

  @Prop({ required: false })
  lastNumberCard: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false, type: Location })
  country: Location;

  @Prop({ required: false, type: Location })
  state: Location;

  @Prop({ required: false })
  city: string;

  @Prop({ required: true })
  totalOriginalPrices: number;

  @Prop({ required: true })
  totalOfferPrices: number;

  @Prop({ required: true })
  totalProducts: number;

  @Prop({ required: true })
  delivery: string;

  @Prop({ required: true, match: /^[0-9]{5}$/ })
  zipCode: string;

  @Prop({ type: [CartItem], default: [] })
  cart: CartItem[];

  @Prop({ required: true, default: () => Date.now() })
  orderDate: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
