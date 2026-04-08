import { Module } from "@nestjs/common";
import { UsersService } from "./service/users.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema,  } from "./schema/users.schema";
import { UserController } from "./controller/users.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
    ]),
  ],
  controllers:[UserController],
  providers: [UsersService],                  
})
export class UsersModule {}