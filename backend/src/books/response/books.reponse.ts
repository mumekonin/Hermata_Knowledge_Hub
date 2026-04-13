export interface BooksResponse {
  id: string;
  title: string;
  author: string;
  category?: string;
  categoryId?: string;
  description?: string;
  fileUrl?: string;
  coverUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
   previewUrl?: string;    
  downloadUrl?: string;
}