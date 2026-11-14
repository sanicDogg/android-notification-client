<script lang="ts">
  import type { ClipboardEntry } from "../lib/api";

  interface Props {
    text?: string | null;
    capturedAt?: number | string | null;
    history?: ClipboardEntry[];
    onDeleteItem?: (id: string | number) => void;
    onClearAll?: () => void;
  }

  let {
    text = "",
    capturedAt = null,
    history = [],
    onDeleteItem,
    onClearAll,
  }: Props = $props();

  let copiedKey = $state<string | number | null>(null);

  function formatTime(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === "") return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString();
  }

  let hasCurrentText = $derived(typeof text === "string" && text.length > 0);
  let formattedTime = $derived(formatTime(capturedAt));

  let filteredHistory = $derived(
    hasCurrentText
      ? history.filter((item, index) => !(index === 0 && item.text === text))
      : history,
  );

  let hasAnyContent = $derived(hasCurrentText || filteredHistory.length > 0);

  function copyText(value: string, key: string | number) {
    if (!value) return;

    navigator.clipboard
      .writeText(value)
      .then(() => {
        copiedKey = key;
        setTimeout(() => {
          if (copiedKey === key) copiedKey = null;
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  }
</script>

<section class="clipboard-panel">
  <div class="panel-header">
    <div class="header-title">
      <svg
        class="header-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        ></path>
      </svg>
      <h2>Android Clipboard</h2>
    </div>

    {#if hasAnyContent && onClearAll}
      <button
        type="button"
        class="clear-all-btn"
        onclick={onClearAll}
        title="Clear everything"
      >
        <span>Clear all</span>
      </button>
    {/if}
  </div>

  <!-- Current buffer -->
  {#if hasCurrentText && text !== null}
    <div class="clipboard-card current">
      <div class="card-top">
        <span class="badge-current">Current</span>
        <div class="card-actions">
          {#if formattedTime}
            <span class="clipboard-time">{formattedTime}</span>
          {/if}
          <button
            type="button"
            class="icon-btn {copiedKey === 'current' ? 'copied' : ''}"
            title={copiedKey === "current" ? "Copied!" : "Copy"}
            onclick={() => copyText(text, "current")}
          >
            {#if copiedKey === "current"}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {:else}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                ></path>
              </svg>
            {/if}
          </button>

          {#if onDeleteItem}
            <button
              type="button"
              class="icon-btn delete"
              title="Delete"
              onclick={() => onDeleteItem(history[0]?.id)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
              </svg>
            </button>
          {/if}
        </div>
      </div>
      <p class="clipboard-text">{text}</p>
    </div>
  {:else}
    <div class="empty-state">Clipboard is empty...</div>
  {/if}

  <!-- History -->
  {#if filteredHistory.length > 0}
    <div class="history-section">
      <div class="section-header">
        <h3>History ({filteredHistory.length})</h3>
      </div>

      <div class="history-list">
        {#each filteredHistory as item (item.id)}
          {@const itemTime = formatTime(item.capturedAt)}
          <div class="clipboard-card history-item">
            <p class="clipboard-text">{item.text}</p>
            <div class="item-meta">
              {#if itemTime}
                <span class="clipboard-time">{itemTime}</span>
              {/if}
              <div class="card-actions">
                <button
                  type="button"
                  class="icon-btn {copiedKey === item.id ? 'copied' : ''}"
                  title={copiedKey === item.id ? "Copied!" : "Copy"}
                  onclick={() => copyText(item.text, item.id)}
                >
                  {#if copiedKey === item.id}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  {:else}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"
                      ></rect>
                      <path
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                      ></path>
                    </svg>
                  {/if}
                </button>

                {#if onDeleteItem}
                  <button
                    type="button"
                    class="icon-btn delete"
                    title="Delete"
                    onclick={() => onDeleteItem(item.id)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      ></path>
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  .clipboard-panel {
    width: 100%;
    max-width: 850px;
    background: white;
    padding: 16px 18px;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
    color: #444;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    min-height: 26px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-icon {
    width: 16px;
    height: 16px;
    color: #007acc;
  }

  h2 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #222;
  }

  h3 {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #8e8e93;
  }

  /* Clear all button in header */
  .clear-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f5f5f7;
    border: 1px solid #e5e5ea;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 0.78rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-all-btn:hover {
    background: #ffebee;
    border-color: #ffcdd2;
    color: #f44336;
  }

  .clipboard-card {
    background: #fafafa;
    border: 1px solid #e5e5ea;
    border-radius: 8px;
    padding: 12px 14px;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;
  }

  .clipboard-card.current {
    background: #f8fbff;
    border-color: rgba(0, 122, 204, 0.25);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .badge-current {
    background: #e1f5fe;
    color: #007acc;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 6px;
    box-shadow: inset 0 0 0 1px rgba(0, 122, 204, 0.15);
  }

  .clipboard-text {
    margin: 0;
    font-size: 0.88rem;
    color: #222;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* History */
  .history-section {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid #f2f2f7;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    min-height: 44px;
    box-sizing: border-box;
  }

  .history-item:hover {
    background: #f5f5f7;
  }

  .history-item .clipboard-text {
    flex: 1;
    font-size: 0.85rem;
  }

  .item-meta {
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 10px;
    flex-shrink: 0;
  }

  .clipboard-time {
    font-size: 11px;
    color: #8e8e93;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    padding: 5px;
    cursor: pointer;
    color: #8e8e93;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .icon-btn:hover {
    background: #e9edf3;
    color: #007acc;
  }

  .icon-btn.copied {
    color: #4caf50;
    background: #e8f5e9;
  }

  .icon-btn.delete:hover {
    background: #ffebee;
    color: #f44336;
  }

  .icon-btn svg {
    width: 14px;
    height: 14px;
  }

  .empty-state {
    color: #aeaeab;
    font-size: 0.82rem;
    padding: 20px 0;
    text-align: center;
  }
</style>
