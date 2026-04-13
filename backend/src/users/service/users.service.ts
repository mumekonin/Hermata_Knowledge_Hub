import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schema/users.schema";
import { LoginDto, UserDto } from "../dto/users.dto";
import * as bcrypt from 'bcrypt';
import { UserResponse } from "../responses/users.responses";
import { commonUtils } from "../../common/utils";

@Injectable()
export class UsersService {
  bcrypt: any;
  constructor(
    //inject the user model to perform database opreations
    @InjectModel(User.name)
    private readonly userModel: Model<User>

  ) { }
  //create new user
  async createUser(userDto: UserDto) {
    //check if the user already exists
    const existingUser = await this.userModel.findOne({ email: userDto.email });
    if (existingUser) {
      throw new BadRequestException('user already exists with this email');
    }
    //hashed password
    const hashedPWD = await bcrypt.hash(userDto.password, 10);
    //role assignment
    let role = 'user';
    //prepare the instance to be  saved 
    const newUser = new this.userModel({
      name: userDto.name,
      email: userDto.email,
      password: hashedPWD,
      role: role
    })
    //save the user to db
    const savedUser = await newUser.save();
    const userResponse: UserResponse = {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    }
    return userResponse;
  }
  //user login
  async login(logiDto: LoginDto) {
    //check if the user existes
    const exsistingUser = await this.userModel.findOne({ email: logiDto.email.toLowerCase() });
    if (!exsistingUser) {
      throw new BadRequestException('email not found');
    }
    //compare password
    const isPasswordValid = await bcrypt.compare(logiDto.password, exsistingUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('invalid password');
    }
    const jwtData = {
      userId: exsistingUser._id.toString(),
      role: exsistingUser.role,
      email:exsistingUser.email

    }
    const jwtToken = commonUtils.generateJwtToken(jwtData);

    return ({ token: jwtToken });
  }

  async getUserProfile(userId:string){
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const userProfile: UserResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
    return userProfile;
  }
  async getAllUsersByRole(role:string){
    const users = await this.userModel.find({role:role});
    if(!users||users.length===0){
      throw new NotFoundException('no users found with this role');
    }
    const usersResponse: UserResponse[] = users.map((user) => {
      return {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
    return usersResponse;
  }
   async getMyProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('user not found');
    }
    const userProfile: UserResponse = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      email: user.email
    }
    return userProfile;
  }
}