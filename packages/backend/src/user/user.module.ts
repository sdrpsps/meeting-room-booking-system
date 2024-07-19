import { Module } from '@nestjs/common';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtTokenService],
})
export class UserModule {}
