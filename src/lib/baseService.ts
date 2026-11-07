// src/lib/base-service.ts

import type { SseMessage } from './api';

export function createApiBaseUrl(): string {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  const basePath = import.meta.env.VITE_BASE_PATH || '/abc/';
  const relativePath = `${basePath}/api`.replace(/\/+/g, '/');
  return new URL(relativePath, serverUrl).toString();
}

export abstract class BaseSseService {
  protected apiBase = createApiBaseUrl();

  abstract init(): Promise<void>;
  abstract handleSseMessage(msg: SseMessage): void;
  
  destroy() {  }
}
