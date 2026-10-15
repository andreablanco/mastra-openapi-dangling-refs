import { Mastra } from '@mastra/core/mastra';
import { registerApiRoute } from '@mastra/core/server';
import { z } from 'zod';

const Invoice = z.object({ number: z.string(), total: z.number() }).meta({ id: 'Invoice' });

export const mastra = new Mastra({
  server: {
    build: { openAPIDocs: true, swaggerUI: true },
    apiRoutes: [
      registerApiRoute('/invoices/latest', {
        method: 'GET',
        openapi: {
          responses: {
            200: {
              description: 'ok',
              content: { 'application/json': { schema: z.object({ invoice: Invoice }) } },
            },
          },
        },
        handler: (c) => c.json({ invoice: { number: 'INV-1', total: 1 } }),
      }),
    ],
  },
});
