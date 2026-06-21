import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentOwner } from '../common/owner/current-owner.decorator';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplateResponseDto } from './dto/template-response.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesService } from './templates.service';

/**
 * REST controller for template CRUD. All routes are scoped to the current owner.
 */
@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  /**
   * @param templatesService - The templates application service.
   */
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * Lists the current owner's templates.
   *
   * @param ownerKey - The resolved owner key.
   * @returns The owner's templates.
   */
  @Get()
  @ApiOkResponse({ type: [TemplateResponseDto] })
  findAll(@CurrentOwner() ownerKey: string): Promise<TemplateResponseDto[]> {
    return this.templatesService.findAll(ownerKey);
  }

  /**
   * Returns one of the owner's templates.
   *
   * @param id - The template id.
   * @param ownerKey - The resolved owner key.
   * @returns The template.
   */
  @Get(':id')
  @ApiOkResponse({ type: TemplateResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOwner() ownerKey: string,
  ): Promise<TemplateResponseDto> {
    return this.templatesService.findOne(id, ownerKey);
  }

  /**
   * Creates a template for the current owner.
   *
   * @param dto - The template document.
   * @param ownerKey - The resolved owner key.
   * @returns The created template.
   */
  @Post()
  @ApiCreatedResponse({ type: TemplateResponseDto })
  create(
    @Body() dto: CreateTemplateDto,
    @CurrentOwner() ownerKey: string,
  ): Promise<TemplateResponseDto> {
    return this.templatesService.create(dto, ownerKey);
  }

  /**
   * Replaces one of the owner's templates.
   *
   * @param id - The template id.
   * @param dto - The new template document.
   * @param ownerKey - The resolved owner key.
   * @returns The updated template.
   */
  @Put(':id')
  @ApiOkResponse({ type: TemplateResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentOwner() ownerKey: string,
  ): Promise<TemplateResponseDto> {
    return this.templatesService.update(id, dto, ownerKey);
  }

  /**
   * Deletes one of the owner's templates.
   *
   * @param id - The template id.
   * @param ownerKey - The resolved owner key.
   * @returns A promise that resolves once the template is removed.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentOwner() ownerKey: string): Promise<void> {
    return this.templatesService.remove(id, ownerKey);
  }
}
