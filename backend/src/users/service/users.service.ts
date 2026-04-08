import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schema/users.schema";
import { UserDto } from "../dto/users.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService{
    bcrypt: any;
    constructor(
      //inject the user model to perform database opreations
      @InjectModel(User.name)
private readonly userModel: Model<User>
   
    ){}
    //create new user
    async createUser(userDto:UserDto){
      //check if the user already exists
      const existingUser = await this.userModel.findOne({email:userDto.email});
      if(existingUser){
        throw new BadRequestException('user already exists with this email');
      }
      //hashed password
      const hashedPWD = await bcrypt.hash(userDto.password, 10);
      //role assignment
      let role ='user';
      //prepare the instance to be  saved 
      const newUser = new this.userModel({
        name:userDto.name,
        email:userDto.email,
        password:hashedPWD,
        role:role
      })
      //save the user to db
      return await newUser.save();
    }
}