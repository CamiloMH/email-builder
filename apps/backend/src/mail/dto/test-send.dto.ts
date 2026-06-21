import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Body schema for the test-send endpoint. */
export const testSendSchema = z.object({
  to: z.string().email(),
});

/** Request DTO for sending a test email. */
export class TestSendDto extends createZodDto(testSendSchema) {}

/** Response schema for the test-send endpoint. */
export const testSendResponseSchema = z.object({
  sent: z.boolean(),
});

/** Response DTO for the test-send endpoint (drives the OpenAPI schema). */
export class TestSendResponseDto extends createZodDto(testSendResponseSchema) {}
