// src/lib/notifications.svelte.ts

import { SvelteMap } from 'svelte/reactivity';
import { BaseSseService } from './baseService';
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

const API_PATHS = {
  base: (apiBase: string) => `${apiBase}/pushes`,
  deleteNotification: (apiBase: string, id: string) =>
    `${apiBase}/pushes/${id}`,
  connections: (apiBase: string) => `${apiBase}/events/connections`,
} as const;

export class NotificationService extends BaseSseService {
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

  async #syncClients() {
    try {
      await syncMapFromApi(
        API_PATHS.connections(this.apiBase),
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
        API_PATHS.base(this.apiBase),
        this.notificationsMap,
        (data: NotificationPayload[]) => data,
        'notifications',
      ),
      this.#syncClients(),
    ]);
  }

  async deleteNotification(id: string) {
    this.notificationsMap.delete(id);
    try {
      const res = await fetch(API_PATHS.deleteNotification(this.apiBase, id), {
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

  handleSseMessage(msg: SseMessage) {
    if (!msg || typeof msg !== 'object') return;

    if (!('type' in msg) || msg.type === 'NOTIF') {
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
        // TODO: handleNotificationDeletion(msg.id);
    }
  }
}
