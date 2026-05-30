import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createTestApp } from './testApp';

export async function withTestServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = createTestApp();
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  try {
    const { port } = server.address() as AddressInfo;
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

