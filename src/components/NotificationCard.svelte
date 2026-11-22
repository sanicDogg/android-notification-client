<script lang="ts">
  import type { NotificationPayload } from "../db/schema";

  interface Props {
    item: NotificationPayload;
    isActive: boolean;
    isGrouped?: boolean;
    groupCount?: number;
    isExpanded?: boolean;
    onToggleGroup?: () => void;
    onclick: () => void;
  }

  let {
    item,
    isActive,
    isGrouped = false,
    groupCount = 1,
    isExpanded = false,
    onToggleGroup,
    onclick,
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="card {item.isOngoing ? 'ongoing' : ''} {isActive
    ? 'active'
    : ''} {isGrouped ? 'grouped' : ''} {groupCount > 1 && !isExpanded
    ? 'has-stack'
    : ''}"
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

  {#if !isGrouped && groupCount > 1 && onToggleGroup}
    <button
      type="button"
      class="group-toggle"
      onclick={(e) => {
        e.stopPropagation();
        onToggleGroup();
      }}
    >
      {isExpanded ? `▲ Hide batch (${groupCount})` : `▼ +${groupCount - 1} more`}
    </button>
  {/if}

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
  .card.has-stack {
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.05),
      0 5px 0 -2px #f4f6f8,
      0 6px 4px -2px rgba(0, 0, 0, 0.08);
    margin-bottom: 14px;
  }
  .card:has(+ .card.grouped) {
    margin-bottom: 0;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
  }
  .card.grouped {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
  }
  .card.active,
  .card:focus {
    box-shadow:
      0 0 0 2px #007acc,
      0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
    z-index: 1;
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
    padding-right: 120px;
    min-width: 0;
  }
  .app-name {
    font-weight: bold;
    color: #007acc;
    flex-shrink: 0;
  }
  .package-name {
    color: #888;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
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
  .group-toggle {
    margin-top: 10px;
    padding: 4px 10px;
    font-size: 0.78em;
    font-weight: 600;
    color: #007acc;
    background: #f0f7ff;
    border: 1px solid #cce3ff;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .group-toggle:hover {
    background: #e0f0ff;
  }
  .time {
    font-size: 0.75em;
    color: #aaa;
    position: absolute;
    top: 15px;
    right: 15px;
  }
</style>
