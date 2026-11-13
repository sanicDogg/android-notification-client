import { SvelteMap } from 'svelte/reactivity';
import { BaseSseService } from './baseService';
import { deleteFromMapAndApi, syncMapFromApi } from './api';
import type { ClipboardEntry, ClipboardUpdatedEvent, SseMessage } from './api';

export class ClipboardService extends BaseSseService {
  entriesMap = new SvelteMap<number, ClipboardEntry>();

  history = $derived(
    Array.from(this.entriesMap.values()).sort((a, b) => b.id - a.id),
  );

  latest = $derived(this.history ?? null);

  async init(): Promise<void> {
    await syncMapFromApi<ClipboardEntry, ClipboardEntry[]>(
      `${this.apiBase}/device-state/clipboard`,
      this.entriesMap,
      (data) => data,
      'Clipboard History',
    );
  }

  handleSseMessage(msg: SseMessage): void {
    if (msg.type === 'CLIPBOARD_UPDATED') {
      const event = msg as ClipboardUpdatedEvent;
      this.entriesMap.set(event.data.id, event.data);
    }
  }

  async deleteEntry(id: number) {
    await deleteFromMapAndApi(
      `${this.apiBase}/device-state/clipboard/${id}`,
      this.entriesMap,
      id,
      'clipboard entry',
    );
  }

  async clearHistory(): Promise<void> {
    try {
      const res = await fetch(`${this.apiBase}/device-state/clipboard`, {
        method: 'DELETE',
      });
      if (res.ok) {
        this.entriesMap.clear();
      }
    } catch (err) {
      console.error('Error clearing clipboard history:', err);
    }
  }

  override destroy(): void {
    this.entriesMap.clear();
  }
}
