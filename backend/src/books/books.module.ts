import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { BooksController } from "./controller/books.controller";
import { BooksService } from "./service/books.service";
import { Book, BookSchema, Category, CategorySchema,Favorite, FavoriteSchema} from "./schema/books.schema";
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name,     schema: BookSchema },
      { name: Category.name, schema: CategorySchema },
      {name:Favorite.name, schema:FavoriteSchema}
    ]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [BooksController],
  providers: [BooksService, CloudinaryService],
})
export class BooksModule {}