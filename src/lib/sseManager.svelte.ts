// src/lib/sseManager.svelte.ts
import { createApiBaseUrl } from './baseService';
import type { SseMessage } from './api';
import type { BaseSseService } from './baseService';

export class SseManager {
  #apiBase = createApiBaseUrl();
  #evtSource: EventSource | null = null;
  #services: BaseSseService[];

  constructor(services: BaseSseService[]) {
    this.#services = services;
  }

  init() {
    if (this.#evtSource) return;

    const eventsUrl = `${this.#apiBase}/events`;

    this.#evtSource = new EventSource(eventsUrl);

    this.#evtSource.addEventListener('message', (event) => {
      console.debug('Global SSE Event received:', event.data);
      try {
        const data: SseMessage = JSON.parse(event.data);

        for (const service of this.#services) {
          service.handleSseMessage(data);
        }
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
