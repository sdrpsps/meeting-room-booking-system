import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { JwtTokenService } from 'src/common/services/jwt-token.service';
import { md5 } from 'src/common/utils/md5.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { UserInfoVo } from './vo/user-info.vo';

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

  private async findUser(condition: Prisma.UserWhereUniqueInput) {
    return await this.prismaService.user.findUnique({
      where: {
        ...condition,
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

  async findOneByName(user: LoginUserDto) {
    return await this.findUser({ name: user.userName });
  }

  async findOneById(userId: number) {
    return await this.findUser({ id: userId });
  }

  generateUserInfoVo(
    foundUser: Prisma.PromiseReturnType<typeof this.findUser>,
    generateToken: boolean = false,
  ) {
    const vo = new UserInfoVo();

    vo.id = foundUser.id;
    vo.name = foundUser.name;
    vo.nickName = foundUser.nickName;
    vo.email = foundUser.email;
    vo.avatar = foundUser.avatar;
    vo.phoneNumber = foundUser.phoneNumber;
    vo.isFrozen = foundUser.isFrozen;
    vo.isAdmin = foundUser.isAdmin;
    vo.role = foundUser.role.name;
    vo.permissions = foundUser.role.permissions.map(
      (permission) => permission.permission.code,
    );

    if (generateToken) {
      const loginVo = new LoginUserVo();
      loginVo.userInfo = vo;
      loginVo.accessToken = this.jwtTokenService.generateAccessToken(vo);
      loginVo.refreshToken = this.jwtTokenService.generateRefreshToken(vo);

      return loginVo;
    }

    return vo;
  }

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(
      `register_captcha_${user.email}`,
    );

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

  async login(user: LoginUserDto) {
    const foundUser = await this.findOneByName(user);

    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (foundUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    return this.generateUserInfoVo(foundUser, true);
  }

  async refresh(refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const foundUser = await this.findOneById(data.id);
      const vo = this.generateUserInfoVo(foundUser, true) as LoginUserVo;

      return {
        access_token: vo.accessToken,
        refresh_token: vo.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('token 失效');
    }
  }

  async info(userId: number) {
    const foundUser = await this.findOneById(userId);

    return this.generateUserInfoVo(foundUser);
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${updatePasswordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }

    if (updatePasswordDto.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          password: md5(updatePasswordDto.password),
        },
      });
      return '修改成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '修改失败';
    }
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }

    if (updateUserDto.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          avatar: updateUserDto.avatar,
          nickName: updateUserDto.nickName,
          email: updateUserDto.email,
        },
      });
      return '修改成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '修改失败';
    }
  }

  async freezeUserById(userId: number) {
    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          isFrozen: true,
        },
      });
      return '冻结成功';
    } catch (error) {
      this.logger.error(error, UserService);
      return '冻结失败';
    }
  }

  async findUsersByPage(
    pageNum: number,
    pageSize: number,
    name?: string,
    nickName?: string,
    email?: string,
  ) {
    // 构建 where 条件对象
    const where: Prisma.UserWhereInput = {};
    if (name) {
      where.name = { contains: name };
    }
    if (nickName) {
      where.nickName = { contains: nickName };
    }
    if (email) {
      where.email = { contains: email };
    }

    const [total, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where,
      }),
      this.prismaService.user.findMany({
        where,
        take: pageSize,
        skip: (pageNum - 1) * pageSize,
        orderBy: {
          id: 'desc',
        },
      }),
    ]);

    return {
      total,
      users: users.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = item;
        return rest;
      }),
    };
  }
}
