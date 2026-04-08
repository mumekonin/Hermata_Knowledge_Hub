import { Body, Controller, Post } from "@nestjs/common";
import { UsersService } from "../service/users.service";
import { UserDto } from "../dto/users.dto";

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
}