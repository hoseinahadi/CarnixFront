import { Agent } from 'node:https';
import { backendOrigin } from '@/config/runtime';

const localBackend = new URL(backendOrigin);
export const localHttpsAgent =
  localBackend.protocol === 'https:' &&
  ['localhost', '127.0.0.1', '::1'].includes(localBackend.hostname)
    ? new Agent({ rejectUnauthorized: false })
    : undefined;
