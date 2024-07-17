import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('NODEMAILER_HOST'),
      port: configService.get('NODEMAILER_PORT'),
      auth: {
        user: configService.get('NODEMAILER_AUTH_USER'),
        pass: configService.get('NODEMAILER_AUTH_PASS'),
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: this.configService.get('NODEMAILER_SEND_NAME'),
        address: this.configService.get('NODEMAILER_SEND_FROM'),
      },
      to,
      subject,
      html,
    });
  }
}
