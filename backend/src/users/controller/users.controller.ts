import { BadRequestException, Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { UsersService } from "../service/users.service";
import { LoginDto, UserDto } from "../dto/users.dto";
import { JwtAuthGuard } from "../../common/guards/jwtauth.gourd";

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UsersService
  ) { }

  @Post('/register')
  async registerUser(@Body() userDto: UserDto) {
    const result = await this.userService.createUser(userDto);
    return result;
  }

  @Post('login')
  async logUser(@Body() loginDto:LoginDto){
    const result = await this.userService.login(loginDto);
    return result;
  }

  @Get('allUsersByRole/:role')
  async getAllUsersByRole(@Param('role')  role:string){
    return await this.userService.getAllUsersByRole(role);
  }
  @JwtAuthGuard()
    @Get('profile')
  async getmyProfile(@Req() req) {
    const id = req.user.userId;
    if(!id){
      throw new BadRequestException('invalid user id');
    }
    const result = await this.userService.getMyProfile(id);
    return result;
  }
}
// http://localhost:3000/users/profile

// http://localhost:3000/users/allUsersByRole/admin
// http://localhost:3000/books/create-category
// http://localhost:3000/books/upload-book
// http://localhost:3000/books/get-all-books
// http://localhost:3000/books/update-category/
// http://localhost:3000/books/update-book/69d76c03aad9677bf4b3de14
// http://localhost:3000/books/get-all-categories
// http://localhost:3000/books/delete-book/69d76c03aad9677bf4b3de14
// http://localhost:3000/users/profile
// http://localhost:3000/users/logout
// http://localhost:3000/books/category/
// http://localhost:3000/books/get-all-books
// http://localhost:3000/books/getBookDetail/id


// http://localhost:3000/books/search?key=HISTORY OF ETHIOPIA AND THE HORN
// http://localhost:3000/users/register
// http://localhost:3000/users/login
// http://localhost:3000/books/my-favorites
// http://localhost:3000/books/read/id
// http://localhost:3000/books/download/id
// http://localhost:3000/books/add-to-favorites/id
