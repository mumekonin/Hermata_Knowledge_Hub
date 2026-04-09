import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Book } from "../schema/books.schema";
import { Model } from "mongoose";
import { CloudinaryService } from "../../common/cloudinary/cloudinary.service";
import { CreateBookDto } from "../dto/books.dto";
import { Multer } from 'multer';
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private booksModel: Model<Book>,
    private cloudinaryService: CloudinaryService,
  ) { }
  async createBook(createBookDto: CreateBookDto, bookFile: Express.Multer.File, coverFile?: Express.Multer.File,) {
    // Upload both files to Cloudinary in parallel
    const [fileUrl, coverUrl] = await Promise.all([
      this.cloudinaryService.uploadBookFile(bookFile),
      coverFile
        ? this.cloudinaryService.uploadCoverImage(coverFile)
        : Promise.resolve(null),
    ]);
    const newBook = new this.booksModel({
      title: createBookDto.title,
      author: createBookDto.author,
      categoryId: createBookDto.categoryId,
      description: createBookDto.description,
      fileUrl,
      coverUrl,
    });
    const savedBook = await newBook.save();
    return {
      id: savedBook._id.toString(),
      title: savedBook.title,
      author: savedBook.author,
      description: savedBook.description,
      categoryId: savedBook.categoryId,
      fileUrl: savedBook.fileUrl,
      coverUrl: savedBook.coverUrl,
    };
  }
}