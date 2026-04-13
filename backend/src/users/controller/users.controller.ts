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