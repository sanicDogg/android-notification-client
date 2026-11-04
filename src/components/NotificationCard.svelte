<script lang="ts">
  import type { NotificationPayload } from "../db/schema";

  interface Props {
    item: NotificationPayload;
    isActive: boolean;
    onclick: () => void;
  }

  let { item, isActive, onclick }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="card {item.isOngoing ? 'ongoing' : ''} {isActive ? 'active' : ''}"
  tabindex="0"
  {onclick}
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
