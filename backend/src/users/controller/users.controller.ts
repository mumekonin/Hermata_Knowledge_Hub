import { Body, Controller, Post } from "@nestjs/common";
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

  @Post('/login')
  async logUser(@Body() loginDto:LoginDto){
    const result = await this.userService.login(loginDto);
    return result;
  }
}