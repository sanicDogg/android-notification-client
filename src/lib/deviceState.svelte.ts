// src/lib/deviceState.svelte.ts

export const deviceState = $state({
  batteryLevel: 73,
  isWifiConnected: false,
  wifiName: "Airport_Free_Wi-Fi",
  signalStrength: "medium" as "low" | "medium" | "high" | "none",
  cellularOperator: "t2",
  isBluetoothOn: false,
  isVpnActive: false,
  isMediaPlaying: false,
});
