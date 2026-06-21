import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentOwner } from '../common/owner/current-owner.decorator';
import { TestSendDto, TestSendResponseDto } from './dto/test-send.dto';
import { TEST_SEND_THROTTLE_LIMIT, TEST_SEND_THROTTLE_TTL } from './mail.constants';
import { MailService } from './mail.service';

/**
 * REST controller for sending test emails of a stored template.
 */
@ApiTags('mail')
@Controller('templates/:id')
export class MailController {
  /**
   * @param mailService - The mail application service.
   */
  constructor(private readonly mailService: MailService) {}

  /**
   * Sends a test email of the owned template to the given address. Rendered with
   * the template's sample personalization values. Rate-limited.
   *
   * @param id - The template id.
   * @param dto - The recipient.
   * @param ownerKey - The resolved owner key.
   * @returns Whether the send was accepted.
   */
  @Post('test-send')
  @Throttle({ default: { ttl: TEST_SEND_THROTTLE_TTL, limit: TEST_SEND_THROTTLE_LIMIT } })
  @ApiOperation({ summary: 'Envía un email de prueba de la plantilla a una dirección.' })
  @ApiOkResponse({ type: TestSendResponseDto })
  async testSend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestSendDto,
    @CurrentOwner() ownerKey: string,
  ): Promise<TestSendResponseDto> {
    await this.mailService.sendTest(id, ownerKey, dto.to);
    return { sent: true };
  }
}
