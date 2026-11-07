// src/lib/device-state.svelte.ts

import { SvelteMap } from 'svelte/reactivity';
import { syncMapFromApi } from './api';
import { DEVICE_ID } from '../const.ts';
import type { SseMessage } from './api';
import type { DevicePayload } from '../db/schema';

const API_PATHS = {
  base: (apiBase: string) => `${apiBase}/device-state`,
} as const;

function createApiBaseUrl(): string {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  const basePath = import.meta.env.VITE_BASE_PATH || '/abc/';
  const relativePath = `${basePath}/api`.replace(/\/+/g, '/');
  return new URL(relativePath, serverUrl).toString();
}

export class DeviceStateService {
  #apiBase = createApiBaseUrl();

  devicesMap = new SvelteMap<string, DevicePayload>();

  get currentDevice() {
    return this.devicesMap.get(DEVICE_ID);
  }

  get count() {
    return this.devicesMap.size;
  }

  async init() {
    await syncMapFromApi(
      API_PATHS.base(this.#apiBase),
      this.devicesMap,
      (data: DevicePayload[]) => data,
      'device states',
    );
  }

  handleSseMessage(msg: SseMessage) {
    if (!msg || typeof msg !== 'object') return;

    if (!('type' in msg) || msg.type === 'DEVICE_UPDATED') {
      const updatedDevice = msg as unknown as DevicePayload;
      this.devicesMap.set(DEVICE_ID, updatedDevice);
    }
  }

  destroy() {}
}
