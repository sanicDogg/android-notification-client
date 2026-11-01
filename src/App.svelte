<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type {NotificationPayload} from "./db/schema";

  const SERVER_URL = "http://localhost:3000";
  const API_BASE = `${SERVER_URL}/api/pushes`; 

  let notifications: NotificationPayload[] = $state([]);
  let evtSource;

  const MAX_NOTIFICATIONS_COUNT = 50;

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
      notifications = [newNotify, ...notifications].slice(0, MAX_NOTIFICATIONS_COUNT);
    };

    evtSource.onerror = (err) => {
      console.error("Error in SSE connection:", err);
    };
  });

  onDestroy(() => {
    if (evtSource) evtSource.close();
  });
</script>


<main>
  <h2>Android Notifications Stream</h2>

  <div class="logs">
    {#each notifications as item}
      <div class="card {item.isOngoing ? 'ongoing' : ''}">
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    border-left: 4px solid #007acc;
    position: relative;
  }
  .card.ongoing {
    border-left-color: #ff9800; 
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
