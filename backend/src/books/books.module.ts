import { Module } from "@nestjs/common";
import { BooksService } from "./service/books.service";
import { BooksController } from "./controller/books.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Book, BookSchema,Category, CategorySchema } from "./schema/books.schema";
import { CloudinaryService } from "../common/cloudinary/cloudinary.service";

@Module({
  imports: [
     MongooseModule.forFeature([
          { name: Book.name, schema: BookSchema },
          { name: Category.name, schema: CategorySchema }
        ]),
  ],
  controllers: [BooksController],
  providers: [BooksService , CloudinaryService]
})
 export class BooksModule{};