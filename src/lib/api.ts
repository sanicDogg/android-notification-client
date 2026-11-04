import { SvelteMap } from "svelte/reactivity";
import type { ClientInfo, NotificationPayload } from "../db/schema";

/**
 * Universal helper for SvelteMap sync with API data
 * @param url — API URL
 * @param map — SvelteMap link to update
 * @param extractList — Get list from response function
 * @param errorLabel — For logging
 */
export async function syncMapFromApi<T, R, K extends keyof T = 'id'>(
  url: string,
  map: SvelteMap<T[K], T>,
  extractList: (data: R) => T[],
  errorLabel = "API",
  key: K = 'id' as K
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
export interface ClientConnectedEvent {
  type: "CLIENT_CONNECTED";
  client: ClientInfo;
}

export interface ClientDisconnectedEvent {
  type: "CLIENT_DISCONNECTED";
  clientId: string;
}

export interface NotificationDeletedEvent {
  type: "DELETED";
  id: string;
}

export interface WelcomeEvent {
  type: "WELCOME";
  YourId: string;
}

export type SseMessage = 
  | ClientConnectedEvent 
  | ClientDisconnectedEvent 
  | NotificationDeletedEvent 
  | WelcomeEvent
  | NotificationPayload;
