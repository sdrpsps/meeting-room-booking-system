import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';

interface JwtUserData {
  userId: number;
  name: string;
  role: string;
  permissions: string[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  /**
   * 用 reflector 取出 handler 或者 controller 上的 require-permission 的 metadata。
   * 如果没有，就是不需要权限，直接放行，返回 true。
   * 对于需要的每个权限，检查下用户是否拥有，没有的话就返回 401，提示没权限。
   * 否则就放行，返回 true。
   * @param context
   * @returns Boolean
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return true;
    }

    const permissions = request.user.permissions;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'required-permission',
      [context.getClass(), context.getHandler()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const found = requiredPermissions.some((rp) => {
      return permissions.includes(rp);
    });
    if (!found) {
      throw new UnauthorizedException('用户无权限');
    }

    return true;
  }
}
