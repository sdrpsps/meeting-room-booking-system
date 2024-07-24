import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CaptchaService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async setCaptcha(key: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(key, code, 5 * 60);

    return code;
  }

  async sendCaptcha(address: string, subject: string, content: string) {
    await this.emailService.sendMail({
      to: address,
      subject,
      html: content,
    });
  }
}
