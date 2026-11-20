// src/lib/sseManager.svelte.ts
import { createApiBaseUrl } from './baseService';
import type { SseMessage } from './api';
import type { BaseSseService } from './baseService';
import type { AppStateService } from './appState.svelte';

export class SseManager {
  #apiBase = createApiBaseUrl();
  #evtSource: EventSource | null = null;
  #services: BaseSseService[];
  #appState: AppStateService;
  #cleanupEffect: (() => void) | null = null;

  constructor(services: BaseSseService[], appState: AppStateService) {
    this.#services = services;
    this.#appState = appState;
  }

  init() {
    if (this.#cleanupEffect) return;

    this.#cleanupEffect = $effect.root(() => {
      $effect(() => {
        if (this.#appState.sseEnabled) {
          this.#connect();
        } else {
          this.#disconnect();
        }
      });
    });
  }

  #connect() {
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

  #disconnect() {
    if (this.#evtSource) {
      this.#evtSource.close();
      this.#evtSource = null;
    }
  }

  destroy() {
    if (this.#cleanupEffect) {
      this.#cleanupEffect();
      this.#cleanupEffect = null;
    }
    this.#disconnect();
  }
}
