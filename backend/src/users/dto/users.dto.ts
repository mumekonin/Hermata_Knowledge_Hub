import { IsAlpha, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserDto{
  @IsString()
  @IsAlpha()
  name!:string;
  @IsEmail()
  @IsNotEmpty()
  email!:string;
  @IsString()
  @IsNotEmpty()
  password!:string;

}
export class LoginDto {
    @IsNotEmpty()
    @IsString()
    email!: string;
    @IsNotEmpty()
    @IsString()
    password!: string
}