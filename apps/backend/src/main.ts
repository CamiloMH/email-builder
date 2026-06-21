import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';

const OPENAPI_PATH = '/openapi.json';
const REFERENCE_PATH = '/reference';
const DEFAULT_PORT = 3005;

/**
 * Boots the NestJS application: configures CORS and proxy trust, mounts the
 * OpenAPI document and the Scalar API reference, and starts listening.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    exposedHeaders: ['Content-Disposition'],
  });

  const expressApp = app.getHttpAdapter().getInstance();
  // Honour x-forwarded-for so the IP owner strategy works behind a proxy.
  expressApp.set('trust proxy', 1);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Email Templates API')
    .setDescription('API para construir, renderizar y exportar email templates por bloques.')
    .setVersion('1.0.0')
    .build();
  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, swaggerConfig));

  expressApp.get(OPENAPI_PATH, (_request: unknown, response: { json: (body: unknown) => void }) => {
    response.json(document);
  });
  app.use(REFERENCE_PATH, apiReference({ url: OPENAPI_PATH }));

  const port = config.get<number>('PORT') ?? DEFAULT_PORT;
  await app.listen(port);
}

void bootstrap();
