import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  color: string;

  @Prop({ required: false })
  referenceId: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  originalPrice: number;

  @Prop()
  productUrl: string;

  @Prop({ required: false })
  size: string;

  @Prop({ type: [String], default: [] })
  sizes: string[];

  @Prop({ type: [{ id: String, title: String, imagen: String, selected: Boolean }], default: [] })
  colors: Record<string, any>[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  loading: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);