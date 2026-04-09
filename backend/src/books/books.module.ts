import { Module } from "@nestjs/common";
import { BooksService } from "./service/books.service";
import { BooksController } from "./controller/books.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Book, BookSchema,Category, CategorySchema } from "./schema/books.schema";

@Module({
  imports: [
     MongooseModule.forFeature([
          { name: Book.name, schema: BookSchema },
          { name: Category.name, schema: CategorySchema }
        ]),
  ],
  controllers: [BooksController],
  providers: [BooksService]
})
 export class BooksModule{};