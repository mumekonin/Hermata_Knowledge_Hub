import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps: true})
export class User{
    @Prop()
    name!:string;//!   ! means i'll set later the value of this variable
    @Prop()
    email!:string;
    @Prop()
    password!:string;
    @Prop({default:'user'})
    role!:string;
} 
export const userSchema = SchemaFactory.createForClass(User);