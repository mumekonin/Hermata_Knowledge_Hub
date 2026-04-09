import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  description?: string;
}
export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  author!: string;

  @IsNotEmpty()
  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  description?: string;
}