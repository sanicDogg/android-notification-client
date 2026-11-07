// src/lib/device-state.svelte.ts

import { SvelteMap } from 'svelte/reactivity';
import { BaseSseService } from './baseService';
import { syncMapFromApi } from './api';
import { DEVICE_ID } from '../const.ts';
import type { SseMessage } from './api';
import type { DevicePayload } from '../db/schema';

const API_PATHS = {
  base: (apiBase: string) => `${apiBase}/device-state`,
} as const;

export class DeviceStateService extends BaseSseService {
  devicesMap = new SvelteMap<string, DevicePayload>();

  get currentDevice() {
    return this.devicesMap.get(DEVICE_ID);
  }

  get count() {
    return this.devicesMap.size;
  }

  async init() {
    await syncMapFromApi(
      API_PATHS.base(this.apiBase),
      this.devicesMap,
      (data: DevicePayload) => {
        if (data) {
          return [{ ...data, id: DEVICE_ID }];
        }
        return [];
      },
      'device states',
    );
  }

  handleSseMessage(msg: SseMessage) {
    if (!msg || typeof msg !== 'object') return;

    if (!('type' in msg) || msg.type === 'DEVICE_STATE') {
      const updatedDevice = msg as unknown as DevicePayload;
      this.devicesMap.set(DEVICE_ID, updatedDevice);
    }
  }
}
