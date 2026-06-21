import { ApiErrorCode } from '@email/core';
import { BadRequestException, HttpException, NotFoundException, type ArgumentsHost } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

function mockHost(): { host: ArgumentsHost; status: jest.Mock; json: jest.Mock } {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();

  it('keeps an explicit code from the exception body', () => {
    const { host, status, json } = mockHost();
    filter.catch(
      new NotFoundException({ statusCode: 404, code: ApiErrorCode.TemplateNotFound, message: 'x' }),
      host,
    );
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      code: ApiErrorCode.TemplateNotFound,
      message: 'x',
    });
  });

  it('derives a code from the status when none is given', () => {
    const { host, json } = mockHost();
    filter.catch(new NotFoundException('missing'), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, code: ApiErrorCode.NotFound, message: 'missing' }),
    );
  });

  it('joins array validation messages', () => {
    const { host, json } = mockHost();
    filter.catch(new BadRequestException({ message: ['a', 'b'] }), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: ApiErrorCode.ValidationFailed, message: 'a, b' }),
    );
  });

  it('handles a string response body', () => {
    const { host, json } = mockHost();
    filter.catch(new HttpException('nope', 503), host);
    expect(json).toHaveBeenCalledWith({ statusCode: 503, code: ApiErrorCode.Unknown, message: 'nope' });
  });

  it('maps a non-HTTP error to Unknown 500', () => {
    const { host, status, json } = mockHost();
    filter.catch(new Error('boom'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      code: ApiErrorCode.Unknown,
      message: 'boom',
    });
  });
});
