<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import type { NotificationPayload } from "./db/schema";

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/abc/";
  const API_BASE = `${SERVER_URL}/${BASE_PATH}/api/pushes`;

  const MAX_NOTIFICATIONS_COUNT = 50;

  let evtSource;

  let notificationsMap = new SvelteMap<string, NotificationPayload>();

  let activeId = $state<string | null>(null);
  let logsContainer: HTMLDivElement | null = $state(null);

  let sortedNotifications = $derived.by(() => {
    const list = Array.from(notificationsMap.values());
    return list.sort((a, b) => b.postTime - a.postTime);
  });

  // Get current index for Arrow navigation
  let activeIndex = $derived(
    activeId
      ? sortedNotifications.findIndex((item) => item.id === activeId)
      : -1,
  );

  onMount(async () => {
    try {
      const res = await fetch(`${API_BASE}`);
      if (res.ok) {
        const data: NotificationPayload[] = await res.json();
        
        notificationsMap.clear();
        // Exclude duplicated items
        data.forEach((item) => notificationsMap.set(item.id, item));
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }

    evtSource = new EventSource(`${API_BASE}/events`);
    evtSource.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "DELETED") {
        if (notificationsMap.has(msg.id)) {
          if (activeId === msg.id) {
            let nextActiveId: string | null = null;
            if (sortedNotifications.length > 1) {
              if (activeIndex < sortedNotifications.length - 1) {
                nextActiveId = sortedNotifications[activeIndex + 1].id;
              } else {
                nextActiveId = sortedNotifications[activeIndex - 1].id;
              }
            }
            activeId = nextActiveId;
            focusActiveCard();
          }

          // Remove from UI
          notificationsMap.delete(msg.id);
        }
        return;
      }

      const newNotify: NotificationPayload = msg;

      // Instantly UI update
      notificationsMap.set(newNotify.id, newNotify);

      if (notificationsMap.size > MAX_NOTIFICATIONS_COUNT) {
        const oldest = sortedNotifications[sortedNotifications.length - 1];
        if (oldest && oldest.id !== newNotify.id) {
          notificationsMap.delete(oldest.id);
        }
      }
    };

    evtSource.onerror = (err) => {
      console.error("Error in SSE connection:", err);
    };
  });

  onDestroy(() => {
    if (evtSource) evtSource.close();
  });

  async function focusActiveCard() {
    await tick();
    if (!logsContainer || activeIndex === -1) return;
    const cards = logsContainer.querySelectorAll<HTMLDivElement>(".card");
    if (cards[activeIndex]) {
      cards[activeIndex].focus();
    }
  }

  async function handleKeyDown(event: KeyboardEvent) {
    if (sortedNotifications.length === 0) return;

    const PAGE_STEP = 5;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIdx =
        activeIndex < sortedNotifications.length - 1 ? activeIndex + 1 : 0;
      activeId = sortedNotifications[nextIdx].id;
      focusActiveCard();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevIdx =
        activeIndex > 0 ? activeIndex - 1 : sortedNotifications.length - 1;
      activeId = sortedNotifications[prevIdx].id;
      focusActiveCard();
    } else if (event.key === "PageDown") {
      event.preventDefault();
      const nextIdx = Math.min(
        activeIndex + PAGE_STEP,
        sortedNotifications.length - 1,
      );
      activeId = sortedNotifications[nextIdx].id;
      focusActiveCard();
    } else if (event.key === "PageUp") {
      event.preventDefault();
      const prevIdx = Math.max(activeIndex - PAGE_STEP, 0);
      activeId = sortedNotifications[prevIdx].id;
      focusActiveCard();
    } else if (event.key === "Home") {
      event.preventDefault();
      activeId = sortedNotifications[0].id;
      focusActiveCard();
    } else if (event.key === "End") {
      event.preventDefault();
      activeId = sortedNotifications[sortedNotifications.length - 1].id;
      focusActiveCard();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      if (activeId && notificationsMap.has(activeId)) {
        event.preventDefault();
        const idToDelete = activeId;
        let nextActiveId: string | null = null;

        if (sortedNotifications.length > 1) {
          if (activeIndex < sortedNotifications.length - 1) {
            nextActiveId = sortedNotifications[activeIndex + 1].id;
          } else {
            nextActiveId = sortedNotifications[activeIndex - 1].id;
          }
        }

        // instant remove from UI for smoothness
        notificationsMap.delete(idToDelete);
        activeId = nextActiveId;
        focusActiveCard();

        try {
          const res = await fetch(`${API_BASE}/${idToDelete}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            console.error("Failed to delete notification on server \"%s\"", idToDelete);
          }
        } catch (err) {
          console.error("Error sending delete request:", err);
        }
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<main>
  <h2>Android Notifications Stream</h2>
  <div class="logs" bind:this={logsContainer}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#each sortedNotifications as item (item.id)}
      <div
        class="card {item.isOngoing ? 'ongoing' : ''} {item.id === activeId
          ? 'active'
          : ''}"
        tabindex="0"
        onclick={() => {
          activeId = item.id;
          focusActiveCard();
        }}
      >
        <div class="header-row">
          <span class="app-name">{item.appName || "Android App"}</span>
          <span class="package-name">({item.packageName})</span>
        </div>
        <div class="title">{item.title || "Без заголовка"}</div>
        {#if item.subText}
          <div class="sub-text">{item.subText}</div>
        {/if}
        <div class="content">{item.bigText || item.text || ""}</div>
        <div class="time">{new Date(item.postTime).toLocaleString()}</div>
      </div>
    {:else}
      <p class="empty">There is no notifications yet...</p>
    {/each}
  </div>
</main>

<style>
  .logs {
    padding: 10px;
  }
  .card {
    background: white;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #007acc;
    position: relative;
    outline: none;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .card.active,
  .card:focus {
    box-shadow:
      0 0 0 2px #007acc,
      0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
  }
  .card.ongoing {
    border-left-color: #ff9800;
  }
  .card.ongoing.active,
  .card.ongoing:focus {
    box-shadow:
      0 0 0 2px #ff9800,
      0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .header-row {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 0.8em;
  }
  .app-name {
    font-weight: bold;
    color: #007acc;
  }
  .package-name {
    color: #888;
    font-family: monospace;
  }
  .title {
    font-weight: bold;
    color: #222;
    margin-top: 5px;
  }
  .sub-text {
    font-size: 0.9em;
    color: #666;
    font-style: italic;
    margin-top: 2px;
  }
  .content {
    color: #444;
    margin-top: 5px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .time {
    font-size: 0.75em;
    color: #aaa;
    position: absolute;
    top: 15px;
    right: 15px;
  }
</style>
