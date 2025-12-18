import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const gifStagePath = join(__dirname, '..', '..', 'gif_stage');
  
  app.use('/media', (req, res, next) => {
    try {
      req.url = decodeURIComponent(req.url);
    } catch (e) {
    }
    next();
  });
  
  app.use('/media', express.static(gifStagePath, {
    setHeaders: (res, path) => {
      res.set('Content-Type', 'image/gif');
      res.set('Access-Control-Allow-Origin', '*');
    },
    etag: false,
  }));

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
