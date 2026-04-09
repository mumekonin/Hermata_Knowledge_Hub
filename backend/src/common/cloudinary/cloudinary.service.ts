// cloudinary/cloudinary.service.ts
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

  uploadBookFile(file: Express.Multer.File): Promise<string> {
    return this.upload(file, { resource_type: "raw", folder: "books" });
  }

  uploadCoverImage(file: Express.Multer.File): Promise<string> {
    return this.upload(file, { resource_type: "image", folder: "covers" });
  }
  //extract public_id from cloudinary URL
  private getPublicId(url: string): string {
    const parts = url.split("/");
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1].split(".")[0];
    return `${folder}/${filename}`;
  }

  //delete book file from cloudinary
  async deleteBookFile(fileUrl: string): Promise<void> {
    const publicId = this.getPublicId(fileUrl);
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  }

  //delete cover image from cloudinary
  async deleteCoverImage(coverUrl: string): Promise<void> {
    const publicId = this.getPublicId(coverUrl);
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }
}