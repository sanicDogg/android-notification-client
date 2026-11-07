<script>
  import NotificationCard from "../components/NotificationCard.svelte";
  import { createKeyboardNav } from "../lib/useKeyboardNav.svelte";

  let { notificationService } = $props();

  const nav = createKeyboardNav(
    () => notificationService.sortedNotifications,
    (id) => notificationService.deleteNotification(id),
  );
</script>

<svelte:window onkeydown={nav.handleKeyDown} />

<h2>Android Notifications Stream</h2>

<div class="logs" bind:this={nav.container}>
  {#each notificationService.sortedNotifications as item (item.id)}
    <NotificationCard
      {item}
      isActive={item.id === nav.activeId}
      onclick={() => {
        nav.activeId = item.id;
        nav.focusActiveCard();
      }}
    />
  {:else}
    <p class="empty">There is no notifications yet...</p>
  {/each}
</div>

<style>
  h2 {
    font-family: sans-serif;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
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
