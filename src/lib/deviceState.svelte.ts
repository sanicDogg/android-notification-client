// src/lib/device-state.svelte.ts

import { SvelteMap } from 'svelte/reactivity';
import { BaseSseService } from './baseService';
import { deleteFromMapAndApi, syncMapFromApi } from './api';
import { DEVICE_ID } from '../const';
import type { ClipboardEntry, ClipboardUpdatedEvent, SseMessage } from './api';
import type { DevicePayload } from '../db/schema';

const API_PATHS = {
  base: (apiBase: string) => `${apiBase}/device-state`,
  clipboard: (apiBase: string) => `${apiBase}/device-state/clipboard`,
  clipboardItem: (apiBase: string, id: number | string) =>
    `${apiBase}/device-state/clipboard/${id}`,
} as const;

export class DeviceStateService extends BaseSseService {
  devicesMap = new SvelteMap<string, DevicePayload>();
  clipboardMap = new SvelteMap<number, ClipboardEntry>();

  get currentDevice() {
    return this.devicesMap.get(DEVICE_ID);
  }

  get count() {
    return this.devicesMap.size;
  }

  get clipboardHistory(): ClipboardEntry[] {
    return Array.from(this.clipboardMap.values()).sort(
      (a, b) => b.capturedAt - a.capturedAt,
    );
  }

  async init() {
    await Promise.all([
      syncMapFromApi(
        API_PATHS.base(this.apiBase),
        this.devicesMap,
        (data: DevicePayload) => {
          if (data && !('message' in data)) {
            return [{ ...data, id: DEVICE_ID }];
          }
          return [];
        },
        'device states',
      ),
      syncMapFromApi<ClipboardEntry, ClipboardEntry[], 'id'>(
        API_PATHS.clipboard(this.apiBase),
        this.clipboardMap,
        (data) => (Array.isArray(data) ? data : []),
        'clipboard history',
        'id',
      ),
    ]);
  }

  handleSseMessage(msg: SseMessage) {
    if (!msg || typeof msg !== 'object') return;

    if (!('type' in msg) || msg.type === 'DEVICE_STATE') {
      const updatedDevice = msg as unknown as DevicePayload;
      this.devicesMap.set(DEVICE_ID, updatedDevice);
      return;
    }

    if (msg.type === 'CLIPBOARD_UPDATED') {
      const event = msg as ClipboardUpdatedEvent;
      const entry = event.data;

      const current = this.devicesMap.get(DEVICE_ID);
      if (current) {
        this.devicesMap.set(DEVICE_ID, {
          ...current,
          clipboardText: entry.text,
          clipboardCapturedAt: entry.capturedAt,
        });
      }

      this.clipboardMap.set(entry.id, entry);
      return;
    }

    if (msg.type === 'CLIPBOARD_ITEM_DELETED') {
      const deletedId = Number(msg.id);
      const itemToDelete = this.clipboardMap.get(deletedId);
      const current = this.devicesMap.get(DEVICE_ID);

      if (
        itemToDelete &&
        current &&
        current.clipboardText === itemToDelete.text &&
        current.clipboardCapturedAt === itemToDelete.capturedAt
      ) {
        this.devicesMap.set(DEVICE_ID, {
          ...current,
          clipboardText: null,
          clipboardCapturedAt: null,
        });
      }

      this.clipboardMap.delete(deletedId);
      return;
    }

    if (msg.type === 'CLIPBOARD_ALL_CLEARED') {
      const current = this.devicesMap.get(DEVICE_ID);
      if (current) {
        this.devicesMap.set(DEVICE_ID, {
          ...current,
          clipboardText: null,
          clipboardCapturedAt: null,
        });
      }
      this.clipboardMap.clear();
    }
  }

  async deleteClipboardItem(id: number | string) {
    const numericId = Number(id);
    const itemToDelete = this.clipboardMap.get(numericId);
    const current = this.devicesMap.get(DEVICE_ID);

    if (
      itemToDelete &&
      current &&
      current.clipboardText === itemToDelete.text &&
      current.clipboardCapturedAt === itemToDelete.capturedAt
    ) {
      this.devicesMap.set(DEVICE_ID, {
        ...current,
        clipboardText: null,
        clipboardCapturedAt: null,
      });
    }

    await deleteFromMapAndApi(
      API_PATHS.clipboardItem(this.apiBase, numericId),
      this.clipboardMap,
      numericId,
      'clipboard history item',
    );
  }

  async clearAllClipboard() {
    const current = this.devicesMap.get(DEVICE_ID);
    if (current) {
      this.devicesMap.set(DEVICE_ID, {
        ...current,
        clipboardText: null,
        clipboardCapturedAt: null,
      });
    }
    this.clipboardMap.clear();

    try {
      await fetch(API_PATHS.clipboard(this.apiBase), {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear all clipboard:', err);
    }
  }
}
