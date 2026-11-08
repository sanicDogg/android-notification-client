<script>
  import ControlPanel from "./components/ControlPanel.svelte";
  import TabMenu from "./components/TabMenu.svelte";
  import NotificationsView from "./pages/NotificationsView.svelte";
  import ClipboardView from "./pages/ClipboardView.svelte";
  import FileManagerView from "./pages/FileManagerView.svelte";

  import { NotificationService } from "./lib/notifications.svelte";
  import { DeviceStateService } from "./lib/deviceState.svelte";
  import { FileStorageService } from "./lib/fileStorage.svelte";
  import { SseManager } from "./lib/sseManager.svelte";

  const notificationService = new NotificationService();
  const deviceService = new DeviceStateService();
  const fileStorage = new FileStorageService();

  const sseManager = new SseManager([
    notificationService, 
    deviceService, 
    fileStorage
  ]);

  const deviceState = $derived(deviceService.currentDevice);

  let currentPage = $state("notifications");

  $effect(() => {
    Promise.all([
      notificationService.init(), 
      deviceService.init(),
      fileStorage.init()
    ]).then(() => {
      sseManager.init();
    });

    return () => {
      sseManager.destroy();
      notificationService.destroy();
      deviceService.destroy();
      fileStorage.destroy();
    };
  });

  function handleFilesDropped(files) {
    fileStorage.uploadFiles(files);
  }
</script>

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

  <TabMenu bind:value={currentPage} />

  {#if currentPage === "notifications"}
    <NotificationsView {notificationService} />
  {:else if currentPage === "clipboard"}
    <ClipboardView
      text={deviceState?.clipboardText}
      capturedAt={deviceState?.clipboardCapturedAt}
    />
  {:else if currentPage === "files"}
    <FileManagerView
      files={fileStorage.filesList}
      isUploading={fileStorage.isUploading}
      uploadError={fileStorage.uploadError}
      onFilesDropped={handleFilesDropped}
    />
  {/if}
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
</style>
