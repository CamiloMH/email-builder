import { MailController } from './mail.controller';
import type { MailService } from './mail.service';

describe('MailController', () => {
  let service: jest.Mocked<Pick<MailService, 'sendTest'>>;
  let controller: MailController;

  beforeEach(() => {
    service = { sendTest: jest.fn().mockResolvedValue(undefined) };
    controller = new MailController(service as unknown as MailService);
  });

  it('delegates the test send and reports success', async () => {
    const result = await controller.testSend('id-1', { to: 'a@b.com' } as never, 'owner-1');
    expect(service.sendTest).toHaveBeenCalledWith('id-1', 'owner-1', 'a@b.com');
    expect(result).toEqual({ sent: true });
  });
});
