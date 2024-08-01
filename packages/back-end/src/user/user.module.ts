import { Module } from '@nestjs/common';
import { CaptchaService } from 'src/common/services/captcha.service';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { S3Service } from 'src/common/services/s3.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtTokenService, CaptchaService, S3Service],
})
export class UserModule {}
