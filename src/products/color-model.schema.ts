import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ColorModelDocument = ColorModel & Document;

@Schema()
export class ColorModel {
  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  color: string;

  @Prop({ required: false })
  referenceId: number;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  productUrl: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const ColorModelSchema = SchemaFactory.createForClass(ColorModel);