import { Injectable } from "@nestjs/common";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  private upload(file: Express.Multer.File, options: object): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          if (result) resolve(result.secure_url);
          else reject(new Error("Cloudinary returned no result"));
        }
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }

  //Helpers
  private getExtension(mimetype: string): string {
    const mimeToExt: Record<string, string> = {
      "application/pdf":                                                           "pdf",
      "application/msword":                                                        "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":  "docx",
      "application/vnd.ms-powerpoint":                                             "ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":"pptx",
      "application/vnd.ms-excel":                                                  "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         "xlsx",
      "text/plain":                                                                "txt",
    };
    return mimeToExt[mimetype] || "pdf";
  }

  private extractPublicId(url: string): string {
    const parts    = url.split("/");
    const folder   = parts[parts.length - 2];
    const filename = parts[parts.length - 1].split(".")[0];
    return `${folder}/${filename}`;
  }

  // Upload 
  uploadBookFile(file: Express.Multer.File): Promise<string> {
    const ext      = this.getExtension(file.mimetype);
    const publicId = `${Date.now()}.${ext}`;

    return this.upload(file, {
      resource_type: "raw",
      folder:        "books",
      public_id:     publicId,
      access_mode:   "public",
    });
  }

  uploadCoverImage(file: Express.Multer.File): Promise<string> {
    return this.upload(file, {
      resource_type: "image",
      folder:        "covers",
      public_id:     `${Date.now()}`,
      access_mode:   "public",
    });
  }

  // URL Transformations 
  getPreviewUrl(fileUrl: string): string {
    return fileUrl
  }

  getDownloadUrl(fileUrl: string): string {
    return  fileUrl.replace(
    "/raw/upload/",
    "/raw/upload/fl_attachment:true/"
  );
  }

  // Delete 
  async deleteBookFile(fileUrl: string): Promise<void> {
    const publicId = this.extractPublicId(fileUrl);
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  }

  async deleteCoverImage(coverUrl: string): Promise<void> {
    const publicId = this.extractPublicId(coverUrl);
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }
}