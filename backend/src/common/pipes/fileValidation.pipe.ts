import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

const ALLOWED_BOOK_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
};

const ALLOWED_COVER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

@Injectable()
export class BookFileValidationPipe implements PipeTransform {
  transform(files: {
    bookFile?:  Express.Multer.File[];
    coverFile?: Express.Multer.File[];
  }) {
    //check book file exists
    if (!files.bookFile?.[0]) {
      throw new BadRequestException("Book file is required");
    }

    //check book file type
    if (!ALLOWED_BOOK_TYPES[files.bookFile[0].mimetype]) {
      throw new BadRequestException(
        "Invalid book file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT"
      );
    }
    //check cover type only if provided
    if (files.coverFile?.[0] && !ALLOWED_COVER_TYPES[files.coverFile[0].mimetype]) {
      throw new BadRequestException(
        "Invalid cover type. Allowed: JPG, PNG, WEBP"
      );
    }
    return files;
  }
}