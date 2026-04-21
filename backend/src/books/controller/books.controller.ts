// books.controller.ts
import {
  Body, Controller, Delete, Get,
  Param, Post, Put, Res,
  UploadedFiles, UseInterceptors,
  NotFoundException,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { BooksService } from "../service/books.service";
import { CreateBookDto, CreateCategoryDto, UpdateBookDto, UpdateCategoryDto } from "../dto/books.dto";
import { BookFileValidationPipe } from "../../common/pipes/fileValidation.pipe";
import { AuthGuard } from "@nestjs/passport";
import { DbRolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/roles.enum";

@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) { }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)
  @Post("create-category")
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.booksService.createCategory(createCategoryDto);
  }
  @Get("get-all-categories")
  async getAllCategories() {
    return this.booksService.getAllCategories();
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)
  @Put("update-category/:id")
  async updateCategory(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.booksService.updateCategory(id, updateCategoryDto);
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)
  @Delete("delete-category/:id")
  async deleteCategory(@Param("id") id: string) {
    return this.booksService.deleteCategory(id);
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)

  @Post("upload-book")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "bookFile", maxCount: 1 },
      { name: "coverFile", maxCount: 1 },
    ])
  )
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @UploadedFiles(new BookFileValidationPipe())
    files: {
      bookFile: Express.Multer.File[];
      coverFile?: Express.Multer.File[];
    },
  ) {
    return this.booksService.createBook(
      createBookDto,
      files.bookFile[0],
      files.coverFile?.[0],
    );
  }

  @Get("get-all-books")
  async getAllBooks() {
    return this.booksService.getAllBooks();
  }
  @Get("get-book/:id")
  async getBook(@Param("id") id: string) {
    return this.booksService.getBookById(id);
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)
  @Put("update-book/:id")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "bookFile", maxCount: 1 },
      { name: "coverFile", maxCount: 1 },
    ])
  )
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)
  async updateBook(
    @Param("id") id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFiles(new BookFileValidationPipe())
    files: {
      bookFile?: Express.Multer.File[];
      coverFile?: Express.Multer.File[];
    },
  ) {
    return this.booksService.updateBook(
      id,
      updateBookDto,
      files.bookFile?.[0],
      files.coverFile?.[0],
    );
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.ADMIN)
  @Delete("delete-book/:id")
  async deleteBook(@Param("id") id: string) {
    return this.booksService.deleteBook(id);
  }
  @Get("search")
  async searchBook(@Query("key") key: string) {
    return this.booksService.searchBook(key);
  }
  @Get("category/:id")
  async getBooksByCategory(@Param('id') id: string) {
    const result = await this.booksService.getBooksByCategory(id);
    return result;
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.USER)
  @Post("add-to-favorites/:bookId")
  async addToFavorites(@Req() req: any, @Param("bookId") bookId: string) {
    const userId = req.user.userId;
    console.log("user id : ", userId);
    return this.booksService.addToFavorites(userId, bookId);
  }
  @UseGuards(AuthGuard('jwt'), DbRolesGuard)
  @Roles(Role.USER)
  @Get("my-favorites")
  async getUserFavorites(@Req() req: any) {
    const userId = req.user.userId;
    return this.booksService.getUserFavorites(userId);
  }
  @Get("read/:id")
  async readBook(@Param("id") id: string, @Res() res: Response,) {
    const { previewUrl, title, fileUrl } = await this.booksService.readBook(id);
    const ext = fileUrl.split(".").pop();
    const contentType = this.getContentType(fileUrl);
    const response = await fetch(previewUrl);
    if (!response.ok) {
      throw new NotFoundException("File not found on Cloudinary");
    }
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${title}.${ext}"`
    );
    res.setHeader("Content-Type", contentType);
    const { Readable } = await import("stream");
    Readable.fromWeb(response.body as any).pipe(res);
  }
  @Get("download/:id")
  async downloadBook(@Param("id") id: string, @Res() res: Response,) {
    const { downloadUrl, title, fileUrl } =
      await this.booksService.downloadBook(id);
    const ext = fileUrl.split(".").pop();
    const contentType = this.getContentType(fileUrl);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new NotFoundException("File not found on Cloudinary");
    }
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${title}.${ext}"`
    );
    res.setHeader("Content-Type", contentType);
    const { Readable } = await import("stream");
    Readable.fromWeb(response.body as any).pipe(res);
  }
  @Get('new-arrivals')
  async getNewArrivals() {
    return this.booksService.getNewArrivals();
  }
  private getContentType(fileUrl: string): string {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    const extToMime: Record<string, string> = {
      "pdf": "application/pdf",
      "doc": "application/msword",
      "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "ppt": "application/vnd.ms-powerpoint",
      "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "xls": "application/vnd.ms-excel",
      "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "txt": "text/plain",
    };
    return extToMime[ext || ""] || "application/octet-stream";
  }
}