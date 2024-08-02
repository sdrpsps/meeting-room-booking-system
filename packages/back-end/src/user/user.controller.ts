import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { RequireLogin } from 'src/common/decorators/require-login.decorator';
import { CaptchaService } from 'src/common/services/captcha.service';
import { S3Service } from 'src/common/services/s3.service';
import { UserInfo } from './decorators/user-info.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import type { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Get('register-captcha')
  async registerCaptcha(@Query('address') address: string) {
    if (!address) throw new BadRequestException('请输入邮箱地址');

    const code = await this.captchaService.setCaptcha(
      `register_captcha_${address}`,
    );

    await this.captchaService.sendCaptcha(
      address,
      '注册验证码',
      `<p>你的注册验证码是 ${code}。5分钟内有效。</p>`,
    );

    return '发送成功';
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser);
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    return await this.userService.refresh(refreshToken);
  }

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('id') id: number) {
    return await this.userService.info(id);
  }

  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    if (!address) throw new BadRequestException('请输入邮箱地址');

    const foundUser = await this.userService.findOneByEmail(address);
    if (!foundUser) throw new BadRequestException('用户不存在');

    const code = await this.captchaService.setCaptcha(
      `update_password_captcha_${address}`,
    );

    await this.captchaService.sendCaptcha(
      address,
      '修改密码验证码',
      `<p>你的修改密码验证码是 ${code}。5分钟内有效。</p>`,
    );

    return '发送成功';
  }

  @Post('update_password')
  async updatePassword(
    @UserInfo('id') id: number | undefined,
    @Body() passwordDto: UpdatePasswordDto,
  ) {
    const userId =
      id ?? (await this.userService.findOneByEmail(passwordDto.email))?.id;

    if (!userId) throw new BadRequestException('用户不存在');

    return await this.userService.updatePassword(userId, passwordDto);
  }

  @Get('update_email/captcha')
  @RequireLogin()
  async updateEmailCaptcha(@Query('address') address: string) {
    if (!address) throw new BadRequestException('请输入邮箱地址');

    const foundUser = await this.userService.findOneByEmail(address);
    if (!foundUser) throw new BadRequestException('用户不存在');

    const code = await this.captchaService.setCaptcha(
      `update_email_captcha_${address}`,
    );

    await this.captchaService.sendCaptcha(
      address,
      '修改邮箱验证码',
      `<p>你的修改邮箱验证码是 ${code}。5分钟内有效。</p>`,
    );

    return '发送成功';
  }

  @Post('update_email')
  @RequireLogin()
  async updateEmail(
    @UserInfo('id') id: number | undefined,
    @Body() emailDto: UpdateEmailDto,
  ) {
    const userId =
      id ?? (await this.userService.findOneByEmail(emailDto.email))?.id;

    if (!userId) throw new BadRequestException('用户不存在');

    return await this.userService.updateEmail(userId, emailDto);
  }

  @Post('update')
  @RequireLogin()
  async update(
    @UserInfo('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Get('update/captcha')
  @RequireLogin()
  async updateUserCaptcha(@Query('address') address: string) {
    if (!address) throw new BadRequestException('请输入邮箱地址');

    const code = await this.captchaService.setCaptcha(
      `update_user_captcha_${address}`,
    );

    await this.captchaService.sendCaptcha(
      address,
      '修改用户信息验证码',
      `<p>你的修改用户信息验证码是 ${code}。5分钟内有效。</p>`,
    );

    return '发送成功';
  }

  @Get('freeze')
  @RequireLogin()
  async freeze(
    @Query('id', ParseIntPipe) userId: number,
    @Query('isFreeze', ParseIntPipe) isFreeze: number,
  ) {
    return await this.userService.freezeUserById(userId, !!isFreeze);
  }

  @Get('list')
  async list(
    @Query('pageNum', new DefaultValuePipe(1), ParseIntPipe) pageNum: number,
    @Query('pageSize', new DefaultValuePipe(2), ParseIntPipe) pageSize: number,
    @Query('name') name?: string,
    @Query('nickName') nickName?: string,
    @Query('email') email?: string,
  ) {
    return await this.userService.findUsersByPage(
      pageNum,
      pageSize,
      name,
      nickName,
      email,
    );
  }

  // 临时写死
  @Get('routes')
  @RequireLogin()
  async route() {
    return [
      {
        key: '/app/dashboard',
        icon: 'DashboardOutlined',
        label: '仪表盘',
      },
      {
        key: '/app/user',
        icon: 'UserOutlined',
        label: '用户',
        children: [
          {
            key: '/app/user/profile',
            label: '个人信息',
          },
          {
            key: '/app/user/list',
            label: '列表',
          },
        ],
      },
    ];
  }

  @Post('upload')
  @RequireLogin()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.s3Service.uploadFile(file);
  }
}
