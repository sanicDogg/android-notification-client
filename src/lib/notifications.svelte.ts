// src/lib/notifications.svelte.ts

import { SvelteMap } from 'svelte/reactivity';
import { syncMapFromApi } from './api';
import type {
  ClientConnectedEvent,
  ClientDisconnectedEvent,
  SseMessage,
} from './api';
import type {
  ClientInfo,
  ClientsPayload,
  NotificationPayload,
} from '../db/schema';

export class NotificationService {
  #apiBase: string;
  #evtSource: EventSource | null = null;
  #maxCount = 50;

  notificationsMap = new SvelteMap<string, NotificationPayload>();
  clientsMap = new SvelteMap<string, ClientInfo>();

  get userCount() {
    return this.clientsMap.size;
  }
  get count() {
    return this.notificationsMap.size;
  }

  get sortedNotifications() {
    return Array.from(this.notificationsMap.values())
      .sort((a, b) => b.postTime - a.postTime);
  }

  constructor() {
    const serverUrl = import.meta.env.VITE_SERVER_URL ||
      'http://localhost:3000';
    const basePath = import.meta.env.VITE_BASE_PATH || '/abc/';
    const relativePath = `${basePath}/api/pushes`.replace(/\/+/g, '/');
    this.#apiBase = new URL(relativePath, serverUrl).toString();
  }

  async #syncClients() {
    try {
      await syncMapFromApi(
        `${this.#apiBase}/connections`,
        this.clientsMap,
        (data: ClientsPayload) => data.clients,
        'active connections',
      );
    } catch (err) {
      console.error('Failed to sync clients:', err);
    }
  }

  async init() {
    await Promise.all([
      syncMapFromApi(
        this.#apiBase,
        this.notificationsMap,
        (data: NotificationPayload[]) => data,
        'notifications',
      ),
      this.#syncClients(),
    ]);

    this.#evtSource = new EventSource(`${this.#apiBase}/events`);
    this.#evtSource.addEventListener('message', this.#onSseMessage.bind(this));
    this.#evtSource.onerror = (err) =>
      console.error('Error in SSE connection:', err);
  }

  #onSseMessage(event: MessageEvent) {
    console.debug('Raw SSE Event received:', event.data);
    try {
      const data = JSON.parse(event.data);
      this.#handleSseMessage(data);
    } catch (e) {
      console.error('Failed to parse SSE JSON:', e);
    }
  }

  destroy() {
    this.#evtSource?.close();
  }

  async deleteNotification(id: string) {
    this.notificationsMap.delete(id);
    try {
      const res = await fetch(`${this.#apiBase}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) console.error('Failed to delete on server "%s"', id);
    } catch (err) {
      console.error('Error sending delete request:', err);
    }
  }

  #limitNotifications(newNotifyId: string) {
    if (this.notificationsMap.size <= this.#maxCount) return;
    const oldest =
      this.sortedNotifications[this.sortedNotifications.length - 1];
    if (oldest && oldest.id !== newNotifyId) {
      this.notificationsMap.delete(oldest.id);
    }
  }

  #handleSseMessage(msg: SseMessage) {
    if (!msg || typeof msg !== 'object') return;

    if (!('type' in msg) || msg.type === 'NOTIFICATION') {
      const newNotify = msg as NotificationPayload;
      this.notificationsMap.set(newNotify.id, newNotify);
      this.#limitNotifications(newNotify.id);
      return;
    }

    // System messages processing
    switch (msg.type) {
      case 'CLIENT_CONNECTED': {
        const event = msg as ClientConnectedEvent;
        this.clientsMap.set(event.client.id, event.client);
        break;
      }
      case 'CLIENT_DISCONNECTED': {
        const event = msg as ClientDisconnectedEvent;
        this.clientsMap.delete(event.clientId);
        break;
      }
      case 'WELCOME':
        this.#syncClients();
        break;
      case 'DELETED':
        // handleNotificationDeletion(msg.id);
        break;
    }
  }
}
