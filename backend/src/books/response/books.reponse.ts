export class BooksResponse {
  id!: string;
  title!: string;
  author!: string;
  description!: string;
  category!: string;
  createdAt!: Date;
  updatedAt!: Date;
  categoryId?: string;
  fileUrl?: string;
  coverUrl?: string;
}