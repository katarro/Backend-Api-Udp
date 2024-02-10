import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const port = 4001

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
  console.log('Server is running on: ' + port);
}
bootstrap();
