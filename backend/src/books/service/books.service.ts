import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Book, BookDocument, Category, CategoryDocument } from "../schema/books.schema";
import { Model } from "mongoose";
import { CloudinaryService } from "../../common/cloudinary/cloudinary.service";
import { CreateBookDto, CreateCategoryDto, UpdateBookDto, UpdateCategoryDto } from "../dto/books.dto";
import { BooksResponse } from "../response/books.reponse";

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly booksModel: Model<BookDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private cloudinaryService: CloudinaryService,
  ) { }

  // Category
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const categoryExists = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });
    if (categoryExists) {
      throw new BadRequestException("Category with this name already exists");
    }
    const newCategory = new this.categoryModel({
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    });
    const saved = await newCategory.save();
    return {
      id: saved._id.toString(),
      name: saved.name,
      description: saved.description,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
  //get all categories
  async getAllCategories() {
    const categories = await this.categoryModel.find();
    if (!categories || categories.length === 0) {
      throw new NotFoundException("No categories found");
    }
    return categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
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
    return { message: "Category updated successfully" };
  }
  //delete category only if no books are associated with 
  async deleteCategory(categoryId: string) {
    const existingCategory = await this.categoryModel.findById(categoryId);
    if (!existingCategory) {
      throw new NotFoundException("Category not found");
    }
    const booksWithCategory = await this.booksModel.find({ categoryId });
    if (booksWithCategory && booksWithCategory.length > 0) {
      throw new BadRequestException("Cannot delete category with books in it");
    }
    await this.categoryModel.findByIdAndDelete(categoryId);
    return { message: "Category deleted successfully" };
  }

  // create Books
  async createBook(
    createBookDto: CreateBookDto,
    bookFile: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    // validate category exists
    const categoryExists = await this.categoryModel.findById(createBookDto.categoryId);
    if (!categoryExists) {
      throw new NotFoundException("Category not found");
    }
    //upload files to cloudinary in parallel
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
      previewUrl: this.cloudinaryService.getPreviewUrl(savedBook.fileUrl),
      downloadUrl: this.cloudinaryService.getDownloadUrl(savedBook.fileUrl),
      createdAt: savedBook.createdAt,
      updatedAt: savedBook.updatedAt,
    };
  }
  //get all books 
  async getAllBooks() {
    const books = await this.booksModel.find().populate("categoryId").exec();
    if (!books || books.length === 0) {
      throw new NotFoundException("No books found");
    }
    const booksResponse: BooksResponse[] = books.map((book) => {
      const category = book.categoryId as any;
      return {
        id: book._id.toString(),
        title: book.title,
        author: book.author,
        category: category.name,
        description: book.description,
        fileUrl: book.fileUrl,
        coverUrl: book.coverUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      };
    });
    return booksResponse;
  }
  //get book by id
  async getBookById(bookId: string) {
    const existingBook = await this.booksModel
      .findById(bookId)
      .populate("categoryId")
      .exec();
    if (!existingBook) {
      throw new NotFoundException("Book not found");
    }
    const category = existingBook.categoryId as any;
    const booksResponse: BooksResponse = {
      id: existingBook._id.toString(),
      title: existingBook.title,
      author: existingBook.author,
      category: category.name,
      description: existingBook.description,
      fileUrl: existingBook.fileUrl,
      coverUrl: existingBook.coverUrl,
      createdAt: existingBook.createdAt,
      updatedAt: existingBook.updatedAt,
    };
    return booksResponse;
  }
  //update book
  async updateBook(
    bookId: string,
    updateBookDto: UpdateBookDto,
    bookFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ) {
    const existingBook = await this.booksModel.findById(bookId);
    if (!existingBook) {
      throw new NotFoundException("Book not found");
    }

    // validate category if provided
    if (updateBookDto.categoryId) {
      const categoryExists = await this.categoryModel.findById(updateBookDto.categoryId);
      if (!categoryExists) {
        throw new NotFoundException("Category not found");
      }
      existingBook.categoryId = updateBookDto.categoryId as any;
    }
    // update book file 
    if (bookFile) {
      if (existingBook.fileUrl) {
        await this.cloudinaryService.deleteBookFile(existingBook.fileUrl);
      }
      existingBook.fileUrl = await this.cloudinaryService.uploadBookFile(bookFile);
    }
    // update cover 
    if (coverFile) {
      if (existingBook.coverUrl) {
        await this.cloudinaryService.deleteCoverImage(existingBook.coverUrl);
      }
      existingBook.coverUrl = await this.cloudinaryService.uploadCoverImage(coverFile);
    }

    // update text fields
    if (updateBookDto.title) existingBook.title = updateBookDto.title;
    if (updateBookDto.author) existingBook.author = updateBookDto.author;
    if (updateBookDto.description) existingBook.description = updateBookDto.description;

    const updatedBook = await existingBook.save();

    return {
      id: updatedBook._id.toString(),
      title: updatedBook.title,
      author: updatedBook.author,
      description: updatedBook.description,
      categoryId: updatedBook.categoryId,
      fileUrl: updatedBook.fileUrl,
      coverUrl: updatedBook.coverUrl,
      createdAt: updatedBook.createdAt,
      updatedAt: updatedBook.updatedAt,
    };
  }
  //delete book
  async deleteBook(bookId: string) {
    const existingBook = await this.booksModel.findById(bookId);
    if (!existingBook) {
      throw new NotFoundException("Book not found");
    }
    await Promise.all([
      existingBook.fileUrl
        ? this.cloudinaryService.deleteBookFile(existingBook.fileUrl)
        : Promise.resolve(),
      existingBook.coverUrl
        ? this.cloudinaryService.deleteCoverImage(existingBook.coverUrl)
        : Promise.resolve(),
    ]);
    await this.booksModel.findByIdAndDelete(bookId);
    return { message: "Book deleted successfully" };
  }
  //read book
async readBook(bookId: string) {
  const existingBook = await this.booksModel.findById(bookId).exec();
  if (!existingBook) {
    throw new NotFoundException("Book not found");
  }
  return {
    id:existingBook._id.toString(),
    title:existingBook.title,
    fileUrl:existingBook.fileUrl,   
    previewUrl: this.cloudinaryService.getPreviewUrl(existingBook.fileUrl),
  };
}
 //download book
  async downloadBook(bookId: string) {
    const existingBook = await this.booksModel.findById(bookId).exec();
    if (!existingBook) {
      throw new NotFoundException("Book not found");
    }
    return {
      title:existingBook.title,
      fileUrl:existingBook.fileUrl,
      downloadUrl: this.cloudinaryService.getDownloadUrl(existingBook.fileUrl),
    };
  }
  //search books by title author and category
async searchBook(key: string) {
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    throw new BadRequestException("Search key must be a non-empty string");
  }

  key = key.trim();

  const books = await this.booksModel
    .find({
      $or: [
        { title:       { $regex: key, $options: "i" } },
        { author:      { $regex: key, $options: "i" } },
        { description: { $regex: key, $options: "i" } },
      ],
    })
    .populate("categoryId")
    .exec();

  if (!books || books.length === 0) {
    throw new NotFoundException(`No books found for "${key}"`);
  }

  return books.map((book) => {
    const category = book.categoryId as any;
    return {
      id:          book._id.toString(),
      title:       book.title,
      author:      book.author,
      category:    category.name,
      description: book.description,
      coverUrl:    book.coverUrl,
      previewUrl:  this.cloudinaryService.getPreviewUrl(book.fileUrl),
      downloadUrl: this.cloudinaryService.getDownloadUrl(book.fileUrl),
      createdAt:   book.createdAt,
      updatedAt:   book.updatedAt,
    };
  });
}
}
