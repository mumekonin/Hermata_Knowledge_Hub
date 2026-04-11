import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Book, Category, } from "../schema/books.schema";
import { Model } from "mongoose";
import { CloudinaryService } from "../../common/cloudinary/cloudinary.service";
import { CreateBookDto, CreateCategoryDto, UpdateBookDto, UpdateCategoryDto } from "../dto/books.dto";
import { Multer } from 'multer';
import { BooksResponse } from "../response/books.reponse";
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly booksModel: Model<Book>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private cloudinaryService: CloudinaryService,
  ) { }

  //create category
  async createCategory(createCategoryDto: CreateCategoryDto) {
    //check if the category already exists
    const categoryExsists = await this.categoryModel.findOne({ name: createCategoryDto.name });
    if (categoryExsists) {
      throw new BadRequestException("category with this name already exists");
    }
    const newCategory = new this.categoryModel({
      name: createCategoryDto.name,
      description: createCategoryDto.description
    });
    const saved = await newCategory.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      description: saved.description
    };
  }
  //create book
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
 //get all books
  async getAllBooks() {
    const books = await this.booksModel.find().populate("categoryId").exec();
    if (!books || books.length === 0) {
      throw new BadRequestException("no books found");
    }
    const booksResponse: BooksResponse[] = books.map((books) => {
      const category = books.categoryId as any;
      return {
        id: books._id.toString(),
        title: books.title,
        author: books.author,
        category: category.name,
        description: books.description,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt
      }
    });
    return booksResponse
  }
  async getAllCategories(){
    const categories = await this.categoryModel.find()
    if(!categories|| categories.length===0){
      throw new NotFoundException("no categories found");
    }
    return categories.map((category)=>{
      return {
        id: category._id.toString(),
        name: category.name,
        description: category.description
      }
    })
  }
  //get all books by Id
  async getBookById(bookId: string) {
    //check if the book exists
    const existingBook = await this.booksModel.findById(bookId).populate("categoryId").exec();
    if (!existingBook) {
      throw new BadRequestException("book not found")
    };
    const category = existingBook.categoryId as any;
    const booksResponse: BooksResponse = {
      id: existingBook._id.toString(),
      title: existingBook.title,
      author: existingBook.author,
      category: category.name,
      description: existingBook.description,
      createdAt: existingBook.createdAt,
      updatedAt: existingBook.updatedAt
    }
    return booksResponse
  }
  //update category
  async updateCategory(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.categoryModel.findById(categoryId);

    if (!existingCategory) {
      throw new NotFoundException("Category not found");
    }

    if (updateCategoryDto.name)
      existingCategory.name = updateCategoryDto.name;

    if (updateCategoryDto.description)
      existingCategory.description = updateCategoryDto.description;

    await existingCategory.save();
    return {
      message: "Category updated successfully",
    };
  }
  //update book
  async updateBook(bookId: string, updateBookDto: UpdateBookDto, bookFile?: Express.Multer.File, coverFile?: Express.Multer.File,) {
    // check if book exists
    const existingBook = await this.booksModel.findById(bookId);
    if (!existingBook) {
      throw new NotFoundException("Book not found");
    }

    // if new book file uploaded — delete old one and upload new
    if (bookFile) {
      if (existingBook.fileUrl) {
        await this.cloudinaryService.deleteBookFile(existingBook.fileUrl);
      }
      existingBook.fileUrl = await this.cloudinaryService.uploadBookFile(bookFile);
    }

    // if new cover uploaded — delete old one and upload new
    if (coverFile) {
      if (existingBook.coverUrl) {
        await this.cloudinaryService.deleteCoverImage(existingBook.coverUrl);
      }
      existingBook.coverUrl = await this.cloudinaryService.uploadCoverImage(coverFile);
    }
    //check if the category exists
    if (updateBookDto.categoryId) {
      const categoryExists = await this.categoryModel.findById(updateBookDto.categoryId);
      if (!categoryExists) {
        throw new NotFoundException("Category not found");
      }
      existingBook.categoryId = updateBookDto.categoryId as any;
    }
    if (updateBookDto.title)
      existingBook.title = updateBookDto.title;
    if (updateBookDto.author)
      existingBook.author = updateBookDto.author;
    if (updateBookDto.categoryId)
      existingBook.categoryId = updateBookDto.categoryId as any;
    if (updateBookDto.description)
      existingBook.description = updateBookDto.description;
    //save the updated book
    const updatedBook = await existingBook.save();

    const updateBookResponse: BooksResponse = {
      id: updatedBook._id.toString(),
      title: updatedBook.title,
      author: updatedBook.author,
      description: updatedBook.description,
      categoryId: updatedBook.categoryId.toString(),
      category: "",
      fileUrl: updatedBook.fileUrl,
      coverUrl: updatedBook.coverUrl,
      updatedAt: updatedBook.updatedAt,
      createdAt: updatedBook.createdAt,
    };
    return updateBookResponse;
  }

}