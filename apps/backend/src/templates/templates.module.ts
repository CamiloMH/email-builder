import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from './template.entity';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

/**
 * Module bundling template persistence, CRUD service and REST controller.
 */
@Module({
  imports: [TypeOrmModule.forFeature([TemplateEntity])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
