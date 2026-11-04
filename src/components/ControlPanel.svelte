<script lang="ts">
  interface Props {
    userCount?: number;
    batteryLevel?: number;
    isWifiConnected?: boolean;
    wifiName?: string;
    signalStrength?: "low" | "medium" | "high" | "none";
    cellularOperator?: string;
    isBluetoothOn?: boolean;
    bluetoothName?: string;
    isVpnActive?: boolean;
    notificationCount?: number;
    isMediaPlaying?: boolean;
  }

  let {
    userCount = 0,
    batteryLevel = 100,
    isWifiConnected = true,
    wifiName = "Home_Network",
    signalStrength = "high",
    cellularOperator = "MegaFon",
    isBluetoothOn = false,
    bluetoothName = "AirPods Pro",
    isVpnActive = false,
    notificationCount = 0,
    isMediaPlaying = false,
  }: Props = $props();
</script>

<header class="control-panel">
  <!-- LEFT SIDE: users, notifications, media -->
  <div class="panel-section left">
    <div class="status-item users" title="Active users">
      <!-- users svg -->
      <svg
        class="users-icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <span class="value">{userCount}</span>
    </div>

    {#if notificationCount > 0}
      {#if notificationCount > 0}
        <div class="status-item notifications" title="Notifications">
          <!-- bell svg -->
          <svg
            class="bell-icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          <span class="badge">{notificationCount}</span>
        </div>
      {/if}
    {/if}

    {#if isMediaPlaying}
      <div class="status-item media playing" title="Media is playing">
        <span class="icon-media">
          <span class="bar b1"></span>
          <span class="bar b2"></span>
          <span class="bar b3"></span>
        </span>
      </div>
    {/if}
  </div>

  <!-- RIGHT SIDE: networks, statuses, battery -->
  <div class="panel-section right">
    <!-- VPN -->
    <div
      class="status-item vpn {isVpnActive ? 'active' : ''}"
      title="VPN status"
    >
      <!-- key svg -->
      <svg
        class="vpn-icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L19 4"
        />
      </svg>
      <span class="text">VPN</span>
    </div>

    <!-- Bluetooth -->
    <div
      class="status-item bluetooth {isBluetoothOn ? 'active' : ''}"
      title="Bluetooth: {isBluetoothOn ? bluetoothName : 'Disabled'}"
    >
      <!-- Bluetooth svg -->
      <svg
        class="bluetooth-icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
      </svg>

      {#if isBluetoothOn}
        <span class="bluetooth-info">{bluetoothName}</span>
      {/if}
    </div>

    <!-- Cellular -->
    <div class="status-item network" title="Network signal: {cellularOperator}">
      {#if signalStrength !== "none"}
        <span class="operator-name">{cellularOperator}</span>
      {/if}
      <span class="signal-dots {signalStrength}">
        <span class="dot d1"></span>
        <span class="dot d2"></span>
        <span class="dot d3"></span>
      </span>
    </div>

    <!-- Wi-Fi -->
    <div
      class="status-item wifi {isWifiConnected ? 'connected' : 'disconnected'}"
      title="Wi-Fi status"
    >
      <!-- Wi-Fi svg -->
      <svg
        class="wifi-icon-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0"
        />
      </svg>
      <span class="wifi-info">
        {isWifiConnected ? wifiName : "Offline"}
      </span>
    </div>

    <!-- Battery -->
    <div class="status-item battery" title="Battery level">
      <span class="battery-icon {batteryLevel <= 20 ? 'low' : ''}">
        <span class="battery-level" style="width: {batteryLevel}%"></span>
      </span>
      <span class="value">{batteryLevel}%</span>
    </div>
  </div>
</header>

<style>
  .control-panel {
    width: 100%;
    max-width: 850px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    background: white;
    padding: 12px 18px;
    border-radius: 8px;
    box-sizing: border-box;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
    color: #444;

    margin-bottom: 20px;
  }
  .panel-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Users */
  .users {
    color: #444;
  }
  .users-icon-svg {
    width: 15px;
    height: 15px;
    display: block;
    color: #666;
  }
  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .value {
    color: #222;
    font-weight: 600;
    padding-left: 1px;
  }

  /* Notifications */
  .notifications {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .bell-icon-svg {
    width: 14px;
    height: 14px;
    display: block;
    color: #666;
  }
  .badge {
    background: #e1f5fe;
    color: #007acc;
    font-size: 0.75rem;
    padding: 1px 6px;
    border-radius: 6px;
    font-weight: 600;
    min-width: 12px;
    text-align: center;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    box-shadow: inset 0 0 0 1px rgba(0, 122, 204, 0.15);
  }

  /* Playing media animation */
  .icon-media {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    width: 13px;
    height: 13px;
  }
  .icon-media .bar {
    width: 3px;
    background: #007acc;
    animation: bounce 0.8s ease-in-out infinite alternate;
  }
  .icon-media .b1 {
    height: 30%;
    animation-delay: 0.1s;
  }
  .icon-media .b2 {
    height: 100%;
    animation-delay: 0.3s;
  }
  .icon-media .b3 {
    height: 60%;
    animation-delay: 0.5s;
  }

  @keyframes bounce {
    0% {
      height: 20%;
    }
    100% {
      height: 100%;
    }
  }

  /* VPN */
  .vpn {
    color: #888;
    opacity: 0.4;
    transition: all 0.3s ease;
    font-size: 0.75rem;
    background: #f0f0f0;
    padding: 3px 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .vpn.active {
    opacity: 1;
    background: #e1f5fe;
    color: #0288d1;
    font-weight: 600;
  }
  .vpn-icon-svg {
    width: 13px;
    height: 13px;
    display: block;
    transform: rotate(-45deg);
  }

  /* Bluetooth */
  .bluetooth {
    color: #888;
    opacity: 0.4;
    transition: all 0.3s ease;
  }
  .bluetooth.active {
    opacity: 1;
    color: #007acc;
  }
  .bluetooth-icon-svg {
    width: 14px;
    height: 14px;
    display: block;
  }
  .bluetooth-info {
    font-size: 0.8rem;
    font-weight: 600;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Cellular */
  .operator-name {
    font-size: 0.8rem;
    color: #777;
  }
  .signal-dots {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
  }
  .dot {
    width: 3px;
    background: #ddd;
    border-radius: 1px;
  }
  .d1 {
    height: 4px;
  }
  .d2 {
    height: 8px;
  }
  .d3 {
    height: 12px;
  }

  .high .dot {
    background: #007acc;
  }
  .medium .d1,
  .medium .d2 {
    background: #ff9800;
  }
  .low .d1 {
    background: #f44336;
  }
  .none .dot {
    background: #ddd;
  }

  /* Wi-Fi */
  .wifi {
    color: #888;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .wifi.connected {
    color: #007acc;
    font-weight: 600;
  }
  .wifi.disconnected {
    color: #888;
  }
  .wifi-icon-svg {
    width: 14px;
    height: 14px;
    display: block;
  }
  .wifi-info {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Battery */
  .battery-icon {
    position: relative;
    width: 22px;
    height: 10px;
    border: 1.5px solid #666;
    border-radius: 3px;
    padding: 1px;
    display: flex;
    align-items: center;
  }
  .battery-icon::after {
    content: "";
    position: absolute;
    right: -3px;
    top: 3px;
    width: 1.5px;
    height: 4px;
    background: #666;
    border-radius: 0 1px 1px 0;
  }
  .battery-level {
    height: 100%;
    background: #4caf50;
    border-radius: 1px;
    transition: width 0.3s ease;
  }
  .battery-icon.low .battery-level {
    background: #f44336;
  }
</style>
