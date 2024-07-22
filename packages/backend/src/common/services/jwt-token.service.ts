import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserInfo } from 'src/user/vo/user-info.vo';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(userInfo: UserInfo) {
    return this.jwtService.sign(
      {
        id: userInfo.id,
        name: userInfo.name,
        role: userInfo.role,
        permissions: userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
      },
    );
  }

  generateRefreshToken(userInfo: UserInfo) {
    return this.jwtService.sign(
      {
        id: userInfo.id,
      },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME'),
      },
    );
  }
}
