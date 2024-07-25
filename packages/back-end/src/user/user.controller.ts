import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RequireLogin } from 'src/common/decorators/require-login.decorator';
import { CaptchaService } from 'src/common/services/captcha.service';
import { UserInfo } from './decorators/user-info.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly captchaService: CaptchaService,
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
      `<p>你的注册验证码是 ${code}</p>`,
    );

    return '发送成功';
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser);
  }

  @Get('refresh')
  @RequireLogin()
  async refresh(@Query('refreshToken') refreshToken: string) {
    return await this.userService.refresh(refreshToken);
  }

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('id') id: number) {
    return await this.userService.info(id);
  }

  @Get('update_password/captcha')
  @RequireLogin()
  async updatePasswordCaptcha(@Query('address') address: string) {
    if (!address) throw new BadRequestException('请输入邮箱地址');

    const code = await this.captchaService.setCaptcha(
      `update_password_captcha_${address}`,
    );

    await this.captchaService.sendCaptcha(
      address,
      '修改密码验证码',
      `<p>你的修改密码验证码是 ${code}</p>`,
    );

    return '发送成功';
  }

  @Post('update_password')
  @RequireLogin()
  async updatePassword(
    @UserInfo('id') id: number,
    @Body() passwordDto: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(id, passwordDto);
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
      `<p>你的修改用户信息验证码是 ${code}</p>`,
    );

    return '发送成功';
  }

  @Get('freeze')
  @RequireLogin()
  async freeze(@Query('id', ParseIntPipe) userId: number) {
    return await this.userService.freezeUserById(userId);
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
}
