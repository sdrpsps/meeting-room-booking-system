import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.setGlobalPrefix('/api');
  app.enableCors();

  await app.listen(process.env.NEST_SERVER_PORT || 3000);
}
bootstrap();
