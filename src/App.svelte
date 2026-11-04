<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import ControlPanel from "./components/ControlPanel.svelte";
  import NotificationCard from "./components/NotificationCard.svelte";
  
  import { NotificationService } from "./lib/notifications.svelte";
  import { createKeyboardNav } from "./lib/useKeyboardNav.svelte";
  import { deviceState } from "./lib/deviceState.svelte";

  const service = new NotificationService();
  const nav = createKeyboardNav(
    () => service.sortedNotifications, 
    (id) => service.deleteNotification(id)
  );

  onMount(() => {
    service.init();
  });

  onDestroy(() => {
    service.destroy();
  });
</script>

<svelte:window onkeydown={nav.handleKeyDown} />

<main>
  <ControlPanel
    userCount={service.userCount}
    notificationCount={service.count}
    batteryLevel={deviceState.batteryLevel}
    isWifiConnected={deviceState.isWifiConnected}
    wifiName={deviceState.wifiName}
    signalStrength={deviceState.signalStrength}
    cellularOperator={deviceState.cellularOperator}
    isBluetoothOn={deviceState.isBluetoothOn}
    isVpnActive={deviceState.isVpnActive}
    isMediaPlaying={deviceState.isMediaPlaying}
  />

  <h2>Android Notifications Stream</h2>

  <div class="logs" bind:this={nav.container}>
    {#each service.sortedNotifications as item (item.id)}
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
