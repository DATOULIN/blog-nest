import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './middleware/logger.middleware';
import * as express from 'express';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { AllExceptionsFilter } from './filter/any-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as serveStatic from 'serve-static';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json()); // For parsing application/json
  app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
  // 监听所有的请求路由，并打印日志
  app.use(logger);
  // 使用全局拦截器打印出参
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('api/v1');
  // 过滤处理 HTTP 异常
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  // 配置 Swagger
  const options = new DocumentBuilder()
    .addBearerAuth() // 开启 BearerAuth 授权认证
    .setTitle('Nest zero to one')
    .setDescription('The nest-zero-to-one API description')
    .setVersion('1.0')
    .addTag('test')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-doc', app, document);
  // 设置静态访问
  app.use(
    '/public',
    serveStatic(join(process.cwd(), `/public/`), {
      maxAge: '1d',
      extensions: ['jpg', 'jpeg', 'png', 'gif'],
    }),
  );
  await app.listen(3000);
}

bootstrap();
