<script>
  let { value = $bindable() } = $props();

  function handleKeyDown(event) {
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    if (event.key === "1") {
      value = "notifications";
    } else if (event.key === "2") {
      value = "clipboard";
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<nav class="tab-menu">
  <button
    class:active={value === "notifications"}
    onclick={() => (value = "notifications")}
  >
    Notifications <span class="hotkey">1</span>
  </button>
  <button
    class:active={value === "clipboard"}
    onclick={() => (value = "clipboard")}
  >
    Clipboard <span class="hotkey">2</span>
  </button>
</nav>

<style>
  .tab-menu {
    display: flex;
    gap: 10px;
    margin: 0 0 20px 0;
    background: #e4e9f2;
    padding: 4px;
    border-radius: 8px;
  }

  .tab-menu button {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    padding: 6px 14px;
    font-size: 14px;
    font-weight: 500;
    font-family: sans-serif;
    color: #666;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .tab-menu button:hover {
    color: #333;
  }

  .tab-menu button.active {
    background: #ffffff;
    color: #000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .hotkey {
    font-size: 11px;
    background: rgba(0, 0, 0, 0.06);
    color: #888;
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: bold;
  }

  .tab-menu button.active .hotkey {
    background: #f0f4f8;
    color: #555;
  }
</style>
