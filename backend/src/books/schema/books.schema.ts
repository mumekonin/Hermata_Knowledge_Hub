import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name!: string;
  @Prop()
  description!: string;
}
export type CategoryDocument = Category & Document & {
  createdAt: Date;
  updatedAt: Date;
};
export const CategorySchema = SchemaFactory.createForClass(Category);
@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title!: string;
  @Prop({ required: true })
  author!: string;
  @Prop({ type: Types.ObjectId, ref: "Category", required: true })
  categoryId!: Types.ObjectId;
  @Prop()
  description!: string;
  @Prop({ required: true })
  fileUrl!: string;
  @Prop({ required: true })
  coverUrl!: string ;
}
export type BookDocument = Book & Document & {
  createdAt: Date;
  updatedAt: Date;
};
export const BookSchema = SchemaFactory.createForClass(Book);