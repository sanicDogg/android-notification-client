<script>
  let { text, capturedAt } = $props();

  let formattedTime = $derived(
    capturedAt ? new Date(capturedAt).toLocaleTimeString() : "",
  );
</script>

<h2>Android Clipboard</h2>

<div class="clipboard-container">
  {#if text}
    <div class="clipboard-card">
      <p class="clipboard-text">{text}</p>
      {#if formattedTime}
        <span class="clipboard-time">Captured at: {formattedTime}</span>
      {/if}
    </div>
  {:else}
    <p class="empty">Clipboard is empty...</p>
  {/if}
</div>

<style>
  h2 {
    font-family: sans-serif;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }

  .clipboard-container {
    width: 100%;
    max-width: 675px;
    box-sizing: border-box;
  }

  .clipboard-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #eef2f7;
    font-family: sans-serif;
  }

  .clipboard-text {
    margin: 0 0 10px 0;
    white-space: pre-wrap;
    word-break: break-all;
    color: #2c3e50;
    line-height: 1.5;
  }

  .clipboard-time {
    font-size: 12px;
    color: #95a5a6;
  }

  .empty {
    text-align: center;
    color: #888;
    font-style: italic;
    font-family: sans-serif;
  }
</style>
