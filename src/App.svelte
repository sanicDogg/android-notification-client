<script>
  import ControlPanel from "./components/ControlPanel.svelte";
  import NotificationCard from "./components/NotificationCard.svelte";

  import { NotificationService } from "./lib/notifications.svelte";
  import { DeviceStateService } from "./lib/deviceState.svelte";
  import { SseManager } from "./lib/sseManager.svelte";
  import { createKeyboardNav } from "./lib/useKeyboardNav.svelte";

  const notificationService = new NotificationService();
  const deviceService = new DeviceStateService();

  const sseManager = new SseManager(notificationService, deviceService);

  const deviceState = $derived(deviceService.currentDevice);

  const nav = createKeyboardNav(
    () => notificationService.sortedNotifications,
    (id) => notificationService.deleteNotification(id),
  );

  $effect(() => {
    Promise.all([notificationService.init(), deviceService.init()]).then(() => {
      sseManager.init();
    });

    return () => {
      sseManager.destroy();
      notificationService.destroy();
      deviceService.destroy();
    };
  });
</script>

<svelte:window onkeydown={nav.handleKeyDown} />

<main>
  <ControlPanel
    userCount={notificationService.userCount}
    clients={Array.from(notificationService.clientsMap.values())}
    notificationCount={notificationService.count}
    batteryLevel={deviceState?.batteryLevel}
    isWifiConnected={deviceState?.isWifiConnected}
    wifiName={deviceState?.wifiName}
    signalStrength={deviceState?.signalStrength}
    cellularOperator={deviceState?.cellularOperator}
    isBluetoothOn={deviceState?.isBluetoothOn}
    bluetoothName={deviceState?.bluetoothName}
    isVpnActive={deviceState?.isVpnActive}
    isMediaPlaying={deviceState?.isMediaPlaying}
    isAirplaneMode={deviceState?.isAirplaneModeOn}
    isCharging={deviceState?.isCharging}
  />

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
