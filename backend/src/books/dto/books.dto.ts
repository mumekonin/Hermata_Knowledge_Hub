import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  description?: string;
}
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
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

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  author?: string;
  @IsOptional()
  @IsString()
  categoryId?: string;
  @IsOptional()
  @IsString()
  description?: string;
}