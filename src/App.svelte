<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import type { NotificationPayload } from "./db/schema";

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/abc/";
  const API_BASE = `${SERVER_URL}/${BASE_PATH}/api/pushes`;

  let notifications: NotificationPayload[] = $state([]);
  let evtSource;
  const MAX_NOTIFICATIONS_COUNT = 50;

  let activeIndex = $state(-1);
  let logsContainer: HTMLDivElement | null = $state(null);

  onMount(async () => {
    try {
      const res = await fetch(`${API_BASE}`);
      if (res.ok) {
        notifications = await res.json();
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }

    evtSource = new EventSource(`${API_BASE}/events`);
    evtSource.onmessage = (event) => {
      const newNotify = JSON.parse(event.data);
      notifications = [newNotify, ...notifications].slice(
        0,
        MAX_NOTIFICATIONS_COUNT,
      );

      if (activeIndex >= 0) {
        activeIndex++;
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
    if (!logsContainer) return;
    const cards = logsContainer.querySelectorAll<HTMLDivElement>(".card");
    if (cards[activeIndex]) {
      cards[activeIndex].focus();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (notifications.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex =
        activeIndex < notifications.length - 1 ? activeIndex + 1 : 0;
      focusActiveCard();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex =
        activeIndex > 0 ? activeIndex - 1 : notifications.length - 1;
      focusActiveCard();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      if (activeIndex >= 0 && activeIndex < notifications.length) {
        event.preventDefault();

        notifications = notifications.filter((_, i) => i !== activeIndex);

        if (notifications.length === 0) {
          activeIndex = -1;
        } else if (activeIndex >= notifications.length) {
          activeIndex = notifications.length - 1;
        }

        focusActiveCard();
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
    {#each notifications as item, index}  
      <div
        class="card {item.isOngoing ? 'ongoing' : ''} {index === activeIndex
          ? 'active'
          : ''}"
        tabindex="0"
        onclick={() => { activeIndex = index; focusActiveCard(); }}
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
  }
  .time {
    font-size: 0.75em;
    color: #aaa;
    position: absolute;
    top: 15px;
    right: 15px;
  }
</style>
