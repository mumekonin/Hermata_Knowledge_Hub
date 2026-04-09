// src/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class DbRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true; // no roles required

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log("the user information is " ,user)
    if (!user || !user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return requiredRoles.includes(user.role);
  }
}