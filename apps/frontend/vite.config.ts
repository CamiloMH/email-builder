/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Dev-only middleware that serves `POST /api/send-test` locally, mirroring the
 * Vercel serverless function so `pnpm dev` can send test emails (otherwise the
 * route 404s because Vite does not run the `api/` functions).
 */
function sendTestDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-send-test',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/send-test', (req, res) => {
        void (async () => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ code: 'unknown', message: 'Method not allowed' }));
            return;
          }
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          let payload: unknown = {};
          try {
            payload = JSON.parse(Buffer.concat(chunks).toString() || '{}');
          } catch {
            payload = {};
          }
          const mod = (await server.ssrLoadModule('/api/send-test.ts')) as {
            sendTestEmail: (
              payload: unknown,
              ip: string,
              env: { RESEND_API_KEY?: string; MAIL_FROM?: string },
            ) => Promise<{ status: number; body: Record<string, unknown> }>;
          };
          const result = await mod.sendTestEmail(payload, req.socket.remoteAddress ?? 'local', {
            RESEND_API_KEY: env.RESEND_API_KEY,
            MAIL_FROM: env.MAIL_FROM,
          });
          res.statusCode = result.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result.body));
        })();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
  return {
    plugins: [react(), tailwindcss(), sendTestDevPlugin(env)],
    server: { port: 3000 },
    // Resolve the shared workspace packages to their TypeScript source so Vite
    // bundles them as real ESM (avoids CJS named-export interop issues).
    resolve: {
      alias: {
        '@email/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
        '@email/emails': fileURLToPath(
          new URL('../../packages/emails/src/index.ts', import.meta.url),
        ),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/test/**', 'src/**/*.d.ts'],
        thresholds: {
          lines: 85,
          functions: 85,
          branches: 80,
          statements: 85,
        },
      },
    },
  };
});
