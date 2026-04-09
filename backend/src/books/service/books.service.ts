import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Book, Category,  } from "../schema/books.schema";
import { Model } from "mongoose";
import { CloudinaryService } from "../../common/cloudinary/cloudinary.service";
import { CreateBookDto, CreateCategoryDto } from "../dto/books.dto";
import { Multer } from 'multer';
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly booksModel: Model<Book>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private cloudinaryService: CloudinaryService,
  ) { }
   async createCategory(createCategoryDto: CreateCategoryDto) {
    //check if the category already exists
    const categoryExsists = await this.categoryModel.findOne({name:createCategoryDto.name});
    if(categoryExsists){
      throw new BadRequestException("category with this name already exists");
    }
    const newCategory = new this.categoryModel({
      name:createCategoryDto.name,
      description:createCategoryDto.description
    });
    const saved = await newCategory.save();
    return {
      id:saved._id.toString(),
      name: saved.name,
      description: saved.description
    };
  }
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