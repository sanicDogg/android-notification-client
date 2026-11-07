// src/lib/sseManager.svelte.ts
import type { NotificationService } from './notifications.svelte';
import type { DeviceStateService } from './deviceState.svelte';

function createApiBaseUrl(): string {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
  const basePath = import.meta.env.VITE_BASE_PATH || '/abc/';
  const relativePath = `${basePath}/api`.replace(/\/+/g, '/');
  return new URL(relativePath, serverUrl).toString();
}

export class SseManager {
  #apiBase = createApiBaseUrl();
  #evtSource: EventSource | null = null;
  #notifications: NotificationService;
  #devices: DeviceStateService;

  constructor(notifications: NotificationService, devices: DeviceStateService) {
    this.#notifications = notifications;
    this.#devices = devices;
  }

  init() {
    if (this.#evtSource) return;

    const eventsUrl = `${this.#apiBase}/events`;

    this.#evtSource = new EventSource(eventsUrl);

    this.#evtSource.addEventListener('message', (event) => {
      console.debug('Global SSE Event received:', event.data);
      try {
        const data = JSON.parse(event.data);

        this.#notifications.handleSseMessage(data);
        this.#devices.handleSseMessage(data);
      } catch (e) {
        console.error('Failed to parse Global SSE JSON:', e);
      }
    });

    this.#evtSource.onerror = (err) => {
      console.error('Error in Global SSE connection:', err);
    };
  }

  destroy() {
    if (this.#evtSource) {
      this.#evtSource.close();
      this.#evtSource = null;
    }
  }
}
