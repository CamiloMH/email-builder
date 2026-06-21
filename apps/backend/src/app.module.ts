import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { BlocksModule } from './blocks/blocks.module';
import { ApiExceptionFilter } from './common/errors/api-exception.filter';
import { OwnerMiddleware } from './common/owner/owner.middleware';
import { OwnerModule } from './common/owner/owner.module';
import { NodeEnv, validateEnv } from './config/configuration';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { RenderModule } from './render/render.module';
import { TemplateEntity } from './templates/template.entity';
import { TemplatesModule } from './templates/templates.module';

/**
 * Builds the TypeORM options: MariaDB (via mysql2) normally, in-memory SQLite
 * (sql.js) for the test environment.
 *
 * @param config - The application configuration service.
 * @returns The TypeORM module options.
 */
function buildTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  const nodeEnv = config.get<NodeEnv>('NODE_ENV');
  if (nodeEnv === NodeEnv.Test) {
    return {
      type: 'sqljs',
      autoSave: false,
      dropSchema: true,
      synchronize: true,
      entities: [TemplateEntity],
    };
  }
  return {
    type: 'mariadb',
    connectorPackage: 'mysql2',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_DATABASE'),
    synchronize: config.get<boolean>('DB_SYNCHRONIZE'),
    autoLoadEntities: true,
  };
}

/**
 * Root application module. Wires configuration, persistence, global validation,
 * rate limiting and the feature modules, and applies the owner middleware.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') ?? 60_000,
          limit: config.get<number>('THROTTLE_LIMIT') ?? 120,
        },
      ],
    }),
    OwnerModule,
    TemplatesModule,
    RenderModule,
    MailModule,
    BlocksModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  /**
   * Applies the owner-identification middleware to every route.
   *
   * @param consumer - The middleware consumer.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(OwnerMiddleware).forRoutes('*');
  }
}
