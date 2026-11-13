import { SvelteMap } from 'svelte/reactivity';
import type { ClientInfo, NotificationPayload } from '../db/schema';

/**
 * Universal helper for SvelteMap sync with API data
 * @param url — API URL
 * @param map — SvelteMap link to update
 * @param extractList — Get list from response function
 * @param errorLabel — For logging
 */
export async function syncMapFromApi<T, R, K extends keyof T = keyof T>(
  url: string,
  map: SvelteMap<T[K], T>,
  extractList: (data: R) => T[],
  errorLabel = 'API',
  key: K = 'id' as unknown as K,
) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: R = await res.json();
    const list = extractList(data);

    map.clear();
    if (Array.isArray(list)) {
      for (const item of list) {
        if (item && typeof item === 'object' && key in item) {
          map.set(item[key], item);
        }
      }
    }
  } catch (err) {
    console.error(`Error loading ${errorLabel}:`, err);
  }
}

/**
 * Universal helper removing from SvelteMap and from server
 */
export async function deleteFromMapAndApi<K, V>(
  url: string,
  map: SvelteMap<K, V>,
  id: K,
  errorLabel = 'item',
): Promise<boolean> {
  const backup = map.get(id);
  map.delete(id);

  try {
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) {
      console.error(`Failed to delete ${errorLabel} on server "%s"`, id);
      if (backup !== undefined) map.set(id, backup);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error sending delete request for ${errorLabel}:`, err);
    if (backup !== undefined) map.set(id, backup);
    return false;
  }
}

export interface ClientConnectedEvent {
  type: 'CLIENT_CONNECTED';
  client: ClientInfo;
}

export interface ClientDisconnectedEvent {
  type: 'CLIENT_DISCONNECTED';
  clientId: string;
}

export interface NotificationDeletedEvent {
  type: 'DELETED';
  id: string;
}

export interface WelcomeEvent {
  type: 'WELCOME';
  YourId: string;
}

export interface DeviceFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
}

export interface FileAddedEvent {
  type: 'FILE_ADDED';
  file: DeviceFile;
}

export interface FileDeletedEvent {
  type: 'FILE_DELETED';
  fileId: string;
}

export interface FileListUpdatedEvent {
  type: 'FILE_LIST_UPDATED';
  files: DeviceFile[];
}

export interface ClipboardEntry {
  id: number;
  deviceId: string;
  text: string;
  capturedAt: number;
}

export interface ClipboardUpdatedEvent {
  type: 'CLIPBOARD_UPDATED';
  data: ClipboardEntry;
}

export type SseMessage =
  | ClientConnectedEvent
  | ClientDisconnectedEvent
  | NotificationDeletedEvent
  | WelcomeEvent
  | NotificationPayload
  | FileAddedEvent
  | FileDeletedEvent
  | FileListUpdatedEvent
  | ClipboardUpdatedEvent;
