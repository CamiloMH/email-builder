process.env.NODE_ENV = 'test';

import { BLOCK_TYPE_VALUES, ExportFormat, createDefaultTemplate } from '@email/core';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MAILER } from '../src/mail/mailer.port';
import { EMAIL_RENDERER } from '../src/render/email-renderer.port';
import { RENDER_THROTTLE_LIMIT } from '../src/render/render.constants';

const CLIENT_HEADER = 'x-client-id';
const CLIENT_A = 'client-aaaaaaaa';
const CLIENT_B = 'client-bbbbbbbb';
const rendered = { html: '<html>preview</html>', text: 'preview text' };
const reactSource = "import { Html } from '@react-email/components';\nexport default () => <Html />;";
const sendEmail = jest.fn().mockResolvedValue(undefined);

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(EMAIL_RENDERER)
      .useValue({
        render: jest.fn().mockResolvedValue(rendered),
        renderToReactSource: jest.fn().mockReturnValue(reactSource),
      })
      .overrideProvider(MAILER)
      .useValue({ sendEmail })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer();

  it('GET /health reports ok', () =>
    request(server()).get('/health').expect(200).expect({ status: 'ok' }));

  it('GET /blocks returns the full catalog', () =>
    request(server())
      .get('/blocks')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(BLOCK_TYPE_VALUES.length);
      }));

  it('rejects an invalid template body with 400', () =>
    request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send({ name: '' })
      .expect(400));

  it('isolates templates per visitor and enforces ownership', async () => {
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Owned by A'))
      .expect(201);
    const id = created.body.id as string;

    await request(server())
      .get('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .expect(200)
      .expect((res) => expect(res.body).toHaveLength(1));

    // A different visitor sees none of A's templates...
    await request(server())
      .get('/templates')
      .set(CLIENT_HEADER, CLIENT_B)
      .expect(200)
      .expect((res) => expect(res.body).toHaveLength(0));

    // ...and cannot read, update or delete them.
    await request(server()).get(`/templates/${id}`).set(CLIENT_HEADER, CLIENT_B).expect(404);
    await request(server()).get(`/templates/${id}`).set(CLIENT_HEADER, CLIENT_A).expect(200);

    await request(server())
      .put(`/templates/${id}`)
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Renamed by A'))
      .expect(200)
      .expect((res) => expect(res.body.name).toBe('Renamed by A'));

    await request(server()).delete(`/templates/${id}`).set(CLIENT_HEADER, CLIENT_B).expect(404);
    await request(server()).delete(`/templates/${id}`).set(CLIENT_HEADER, CLIENT_A).expect(204);
  });

  it('renders an ad-hoc document via the (stubbed) renderer', () =>
    request(server())
      .post('/render')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate())
      .expect(201)
      .expect(rendered));

  it('exports a stored template as a downloadable HTML file', async () => {
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Exportable'))
      .expect(201);
    const id = created.body.id as string;

    await request(server())
      .get(`/templates/${id}/export`)
      .query({ format: ExportFormat.Html })
      .set(CLIENT_HEADER, CLIENT_A)
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect((res) => {
        expect(res.headers['content-disposition']).toContain('attachment');
        expect(res.text).toBe(rendered.html);
      });
  });

  it('exports a stored template as a React component (.tsx) file', async () => {
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('React export'))
      .expect(201);
    const id = created.body.id as string;

    await request(server())
      .get(`/templates/${id}/export`)
      .query({ format: ExportFormat.React })
      .set(CLIENT_HEADER, CLIENT_A)
      .expect(200)
      .expect((res) => {
        expect(res.headers['content-disposition']).toContain('react-export.tsx');
        expect(res.text).toBe(reactSource);
      });
  });

  it('exports a stored template as JSON', async () => {
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Json export'))
      .expect(201);
    await request(server())
      .get(`/templates/${created.body.id as string}/export`)
      .query({ format: ExportFormat.Json })
      .set(CLIENT_HEADER, CLIENT_A)
      .expect(200)
      .expect((res) => {
        expect(res.headers['content-disposition']).toContain('json-export.json');
        expect(JSON.parse(res.text)).toMatchObject({ name: 'Json export' });
      });
  });

  it('sends a test email of an owned template', async () => {
    sendEmail.mockClear();
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Test send'))
      .expect(201);
    const id = created.body.id as string;

    await request(server())
      .post(`/templates/${id}/test-send`)
      .set(CLIENT_HEADER, CLIENT_A)
      .send({ to: 'someone@example.com' })
      .expect(201)
      .expect({ sent: true });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it('reports a mail send failure with a stable error code and message', async () => {
    sendEmail.mockRejectedValueOnce(new Error('domain not verified'));
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Fail send'))
      .expect(201);
    await request(server())
      .post(`/templates/${created.body.id}/test-send`)
      .set(CLIENT_HEADER, CLIENT_A)
      .send({ to: 'someone@example.com' })
      .expect(502)
      .expect((res) => {
        expect(res.body.code).toBe('mailSendFailed');
        expect(res.body.message).toContain('domain not verified');
      });
  });

  it('returns a templateNotFound code for a missing template', async () => {
    await request(server())
      .get('/templates/123e4567-e89b-42d3-a456-426614174000')
      .set(CLIENT_HEADER, CLIENT_A)
      .expect(404)
      .expect((res) => expect(res.body.code).toBe('templateNotFound'));
  });

  it('rejects a test send with an invalid email', async () => {
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Bad send'))
      .expect(201);
    await request(server())
      .post(`/templates/${created.body.id}/test-send`)
      .set(CLIENT_HEADER, CLIENT_A)
      .send({ to: 'not-an-email' })
      .expect(400);
  });

  it('does not let another visitor test-send your template', async () => {
    const created = await request(server())
      .post('/templates')
      .set(CLIENT_HEADER, CLIENT_A)
      .send(createDefaultTemplate('Private'))
      .expect(201);
    await request(server())
      .post(`/templates/${created.body.id}/test-send`)
      .set(CLIENT_HEADER, CLIENT_B)
      .send({ to: 'someone@example.com' })
      .expect(404);
  });

  it('rate-limits the render endpoint with 429', async () => {
    const attempts = RENDER_THROTTLE_LIMIT + 5;
    const statuses: number[] = [];
    for (let i = 0; i < attempts; i += 1) {
      const res = await request(server())
        .post('/render')
        .set(CLIENT_HEADER, CLIENT_B)
        .send(createDefaultTemplate());
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
  });
});
