import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

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

export class Location {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;
}

export class BillingAddress {
  name: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
}

export class Card {
  @Prop({ required: true })
  cardNumber: string;

  @Prop({ required: true })
  expirationDate: string;

  @Prop({ required: true })
  cardCVV: string;

  @Prop({ default: false })
  added: boolean;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: false })
  declined: boolean;

  @Prop({ default: () => Date.now() })
  entryDate: Date;
}

@Schema()
export class User {
  @Prop({ required: true, match: /^[a-zA-Z ]+$/ })
  name: string;

  @Prop({ required: true, match: /^[a-zA-Z ]+$/ })
  lastName: string;

  @Prop({ required: false, match: /^[a-zA-Z ]+$/ })
  fullName: string;

  @Prop({ required: true, unique: true, match: /.+\@.+\..+/ })
  email: string;

  @Prop({ required: true, match: /^[0-9]{10}$/ })
  phone: string;

  @Prop({ required: true, minlength: 6, maxlength: 20 })
  password: string;

  @Prop({ required: false})
  address: string;

  @Prop({ required: false, type: Location })
  country: Location;

  @Prop({ required: false, type: Location })
  state: Location;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false, match: /^[0-9]{5}$/ })
  zipCode: string;

  @Prop({ type: [BillingAddress], default: [] })
  billingAddress: BillingAddress;

  @Prop({ type: [CartItem], default: [] })
  cart: CartItem[];

  @Prop({ type: [Card], default: [] })
  cards: Card[];
}

export const UserSchema = SchemaFactory.createForClass(User);