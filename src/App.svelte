<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import type { NotificationPayload } from "./db/schema";

  import ControlPanel from "./components/ControlPanel.svelte";
  import NotificationCard from "./components/NotificationCard.svelte";

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/abc/";
  
  const relativePath = `${BASE_PATH}/api/pushes`.replace(/\/+/g, '/');
  const API_BASE = new URL(relativePath, SERVER_URL).toString();
  
  const MAX_NOTIFICATIONS_COUNT = 50;

  let evtSource: EventSource | null = null;
  let notificationsMap = new SvelteMap<string, NotificationPayload>();

  let activeId = $state<string | null>(null);
  let logsContainer: HTMLDivElement | null = $state(null);

  let sortedNotifications = $derived.by(() => {
    const list = Array.from(notificationsMap.values());
    return list.sort((a, b) => b.postTime - a.postTime);
  });

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
          notificationsMap.delete(msg.id);
        }
        return;
      }

      const newNotify: NotificationPayload = msg;
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

        notificationsMap.delete(idToDelete);
        activeId = nextActiveId;
        focusActiveCard();

        try {
          const res = await fetch(`${API_BASE}/${idToDelete}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            console.error(
              'Failed to delete notification on server "%s"',
              idToDelete,
            );
          }
        } catch (err) {
          console.error("Error sending delete request:", err);
        }
      }
    }
  }

  let userCount = $state(4);
  let batteryLevel = $state(73);
  let isWifiConnected = $state(false);
  let wifiName = $state("Airport_Free_Wi-Fi");
  let signalStrength: "low" | "medium" | "high" | "none" = $state("medium");
  let cellularOperator = $state("t2");
  let isBluetoothOn = $state(false);
  let isVpnActive = $state(false);
  let isMediaPlaying = $state(false);
</script>

<svelte:window onkeydown={handleKeyDown} />

<main>
  <ControlPanel 
    {userCount}
    {batteryLevel}
    {isWifiConnected}
    {wifiName}
    {signalStrength}
    {cellularOperator}
    {isBluetoothOn}
    {isVpnActive}
    notificationCount={notificationsMap.size}
    {isMediaPlaying}
  />

  <h2>Android Notifications Stream</h2>

  <div class="logs" bind:this={logsContainer}>
    {#each sortedNotifications as item (item.id)}
      <NotificationCard
        {item}
        isActive={item.id === activeId}
        onclick={() => {
          activeId = item.id;
          focusActiveCard();
        }}
      />
    {:else}
      <p class="empty">There is no notifications yet...</p>
    {/each}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    background-color: #f5f7fb;
  }

  h2 {
    font-family: sans-serif;
    color: #333;
    margin-bottom: 15px;
  }

  .logs {
    width: 100%;
    max-width: 675px;
    box-sizing: border-box;
  }

  .empty {
    text-align: center;
    color: #888;
    font-style: italic;
    font-family: sans-serif;
  }
</style>
