import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RequireLogin } from 'src/common/decorators/require-login.decorator';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Get('register-captcha')
  async registerCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });

    return '发送成功';
  }

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser, false);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    return await this.userService.login(loginUser, true);
  }

  @RequireLogin()
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    return await this.userService.refresh(refreshToken, false);
  }

  @RequireLogin()
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    return await this.userService.refresh(refreshToken, true);
  }
}
