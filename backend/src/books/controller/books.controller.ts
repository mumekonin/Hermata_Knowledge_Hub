import { Body, Controller, Get, Param, Post, Put, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { BooksService } from "../service/books.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateBookDto, CreateCategoryDto, UpdateBookDto, UpdateCategoryDto } from "../dto/books.dto";
@Controller("books")
export class BooksController {
  constructor(
    private readonly booksService: BooksService
  ) { }
  @Post("create-category")
  async createCategory(@Body() createCtegory: CreateCategoryDto) {
    const result = await this.booksService.createCategory(createCtegory);
    return result;
  }
  @Post("upload-book")
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
  @Get("get-all-books")
  async getAllBooks() {
    const result = await this.booksService.getAllBooks();
    return result
  }
  @Get("getBookDetail/:id")
  async getBook(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }
  @Put("update-category/:id")
  async updateCategory(@Param('id') id: string, @Body() updateCategory: UpdateCategoryDto) {
    const result = await this.booksService.updateCategory(id, updateCategory);
    return result;
  }
  @Put("update-book/:id")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "bookFile", maxCount: 1 },  // optional on update
      { name: "coverFile", maxCount: 1 },  // optional on update
    ])
  )
  async updateBook(
    @Param("id") id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFiles()
    files: {
      bookFile?: Express.Multer.File[];
      coverFile?: Express.Multer.File[];
    },
  ) {
    const result = await this.booksService.updateBook(id, updateBookDto, files.bookFile?.[0], files.coverFile?.[0]);
    return result;
  }
}
