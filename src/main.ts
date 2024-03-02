import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const port = 4001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // quitará las propiedades no esperadas del DTO
    transform: true, // transformará los objetos planos en instancias de clases de DTO
    forbidNonWhitelisted: true, // lanzará una excepción si hay propiedades no esperadas
    transformOptions: {
      enableImplicitConversion: true, // permitirá la conversión implícita de tipos (por ejemplo, convertir un string a un número)
    },
  }));

  app.enableCors();
  
  await app.listen(port);
  console.log(`Server is running on: ${port}`);
}

bootstrap();
