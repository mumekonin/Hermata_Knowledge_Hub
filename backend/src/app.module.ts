import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './common/strategy/jwt.strategy';
import { CloudinaryModule } from './common/cloudinary/claoudinary.module';

@Module({
  imports: [UsersModule,CloudinaryModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),],
  controllers: [AppController],
  providers: [AppService,JwtStrategy],
})
export class AppModule {}
