import { Body, Controller, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { BooksService } from "../service/books.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateBookDto, CreateCategoryDto } from "../dto/books.dto";
@Controller("books")
export class BooksController {
  constructor(
    private readonly booksService: BooksService
  ) { }
  @Post("/create-category")
  async createCategory(@Body() createCtegory:CreateCategoryDto){
    const result = await this.booksService.createCategory(createCtegory);
    return result;
  }
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "bookFile", maxCount: 1 },
      { name: "coverFile", maxCount: 1 },
    ])
  )
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles()
    files: {
      bookFile: Express.Multer.File[];
      coverFile?: Express.Multer.File[];
    },
  ) {
    const result = await this.booksService.createBook(createBookDto, files.bookFile[0], files.coverFile?.[0]);
    return result;
  }
}