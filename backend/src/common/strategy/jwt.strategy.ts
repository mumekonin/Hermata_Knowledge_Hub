
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    };
    super(options);
  }

  async validate(payload: any) {
    // payload contains whatever you signed in JWT
    const { userId, role ,email} = payload;
       console.log('JWT payload:', payload); // Debugging log
    return {
      userId,
      role,
      email
    };
  }
}
