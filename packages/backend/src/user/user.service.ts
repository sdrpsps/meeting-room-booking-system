import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { md5 } from 'src/common/utils/md5.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;

  private async findUser(
    condition: Prisma.UserWhereUniqueInput,
    isAdmin: boolean,
  ) {
    return await this.prismaService.user.findUnique({
      where: {
        ...condition,
        isAdmin,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findOneByName(user: LoginUserDto, isAdmin: boolean) {
    return await this.findUser({ name: user.userName }, isAdmin);
  }

  async findOneById(userId: number, isAdmin: boolean) {
    return await this.findUser({ id: userId }, isAdmin);
  }

  generateUserInfoVo(
    foundUser: Prisma.PromiseReturnType<typeof this.findUser>,
    generateToken: boolean = false,
  ) {
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: foundUser.id,
      name: foundUser.name,
      nickName: foundUser.nickName,
      email: foundUser.email,
      avatar: foundUser.avatar,
      phoneNumber: foundUser.phoneNumber,
      isFrozen: foundUser.isFrozen,
      isAdmin: foundUser.isAdmin,
      role: foundUser.role.name,
      permissions: foundUser.role.permissions.map(
        (permission) => permission.permission.code,
      ),
    };

    if (generateToken) {
      vo.accessToken = this.jwtTokenService.generateAccessToken(vo.userInfo);
      vo.refreshToken = this.jwtTokenService.generateRefreshToken(vo.userInfo);
    }

    return vo;
  }

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.prismaService.user.findUnique({
      where: { name: user.userName },
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prismaService.user.create({
        data: {
          name: user.userName,
          password: md5(user.password),
          email: user.email,
          nickName: user.nickName,
          roleId: 1,
        },
      });
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }

  async login(user: LoginUserDto, isAdmin: boolean) {
    const foundUser = await this.findOneByName(user, isAdmin);

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (foundUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    return this.generateUserInfoVo(foundUser, true);
  }

  async refresh(refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const foundUser = await this.findOneById(data.userId, isAdmin);
      const vo = this.generateUserInfoVo(foundUser, true);

      return {
        access_token: vo.accessToken,
        refresh_token: vo.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('token 失效');
    }
  }
}
