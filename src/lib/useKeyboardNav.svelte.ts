// src/lib/useKeyboardNav.svelte.ts

import { tick } from 'svelte';
import type { NotificationPayload } from '../db/schema';

export function createKeyboardNav(
  getNotifications: () => NotificationPayload[],
  onDelete: (id: string) => void,
) {
  let activeId = $state<string | null>(null);
  let container = $state<HTMLDivElement | null>(null);

  const notifications = $derived(getNotifications());
  const activeIndex = $derived(
    activeId ? notifications.findIndex((n) => n.id === activeId) : -1,
  );

  async function focusActiveCard() {
    await tick();
    if (!container || activeIndex === -1) return;
    const cards = container.querySelectorAll<HTMLDivElement>('.card');
    cards[activeIndex]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (notifications.length === 0) return;
    const PAGE_STEP = 5;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        activeId =
          notifications[
            activeIndex < notifications.length - 1
              ? activeIndex + 1
              : 0
          ].id;
        focusActiveCard();
        break;
      case 'ArrowUp':
        event.preventDefault();
        activeId =
          notifications[
            activeIndex > 0
              ? activeIndex - 1
              : notifications.length - 1
          ].id;
        focusActiveCard();
        break;
      case 'PageDown':
        event.preventDefault();
        activeId =
          notifications[
            Math.min(activeIndex + PAGE_STEP, notifications.length - 1)
          ].id;
        focusActiveCard();
        break;
      case 'PageUp':
        event.preventDefault();
        activeId = notifications[Math.max(activeIndex - PAGE_STEP, 0)].id;
        focusActiveCard();
        break;
      case 'Home':
        event.preventDefault();
        activeId = notifications[0].id;
        focusActiveCard();
        break;
      case 'End':
        event.preventDefault();
        activeId = notifications[notifications.length - 1].id;
        focusActiveCard();
        break;
      case 'Delete':
      case 'Backspace':
        if (activeId) {
          event.preventDefault();
          const idToDelete = activeId;

          if (notifications.length > 1) {
            activeId = activeIndex < notifications.length - 1
              ? notifications[activeIndex + 1].id
              : notifications[activeIndex - 1].id;
          } else {
            activeId = null;
          }

          onDelete(idToDelete);
          focusActiveCard();
        }
        break;
    }
  }

  return {
    get activeId() {
      return activeId;
    },
    set activeId(val) {
      activeId = val;
    },
    get container() {
      return container;
    },
    set container(val) {
      container = val;
    },
    handleKeyDown,
    focusActiveCard,
  };
}
