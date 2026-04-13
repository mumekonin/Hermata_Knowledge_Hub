import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
//category shema
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

//book shema 
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

//favorite shema
@Schema({ timestamps: true })
export class Favorite{
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Book", required: true })
  bookId!: Types.ObjectId;
}
export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
