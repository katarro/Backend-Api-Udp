import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.enableCors();

  const port = process.env.PORT || 4001;
  await app.listen(port);
  console.log(`Server is running on: ${port}`);

  // Middleware para registrar las URLs solicitadas
  app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
  });
}

bootstrap().catch(error => {
  console.error('Error during bootstrap:', error);
});
