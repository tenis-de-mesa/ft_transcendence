// https://docs.nestjs.com/techniques/validation#auto-validation

import * as session from 'express-session';
import * as passport from 'passport';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeormStore } from 'connect-typeorm';
import { AppModule } from './app.module';
import { AxiosExceptionFilter } from './filters';
import { Session } from './core/entities';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger
  const config = new DocumentBuilder().setTitle('API Docs').addOAuth2().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const sessionRepository = app.get(DataSource).getRepository(Session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore().connect(sessionRepository),
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AxiosExceptionFilter());

  await app.listen(3001);
}
bootstrap();
