import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('API 문서')
    .setDescription('NestJS Swagger 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증 사용하는 경우 추가
    .build();

  const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
