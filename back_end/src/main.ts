import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('LearnBySign API')
    .setDescription('API cho ứng dụng học ngôn ngữ ký hiệu - Bao gồm: Auth, Lessons, Media, Progress')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Lessons', 'Quản lý bài học - Lấy danh sách, chi tiết, CRUD bài học')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, doc, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'LearnBySign API Docs',
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
