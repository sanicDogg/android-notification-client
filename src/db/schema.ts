export interface NotificationPayload {
  id: string;
  packageName: string;
  appName?: string | null;
  title?: string | null;
  text?: string | null;
  subText?: string | null;
  bigText?: string | null;
  postTime: number;
  timestampIso: string;
  channelId?: string | null;
  notificationKey?: string | null;
  type: string;
  isOngoing: boolean;
}

export interface ClientInfo {
  id: string;
  ip: string;
  userAgent: string;
  connectedAt: string;
}

export interface ClientsPayload {
  total: number;
  clients: ClientInfo[];
}

export interface DevicePayload {
 timestamp: number;
 timestampIso: string;
 deviceId: string;
 batteryLevel: number;
 isWifiConnected: boolean;
 type?: string | null;
 wifiName?: string | null;
 isCellularConnected?: boolean | null;
 signalStrength?: "low" | "medium" | "high" | "none" | null;
 cellularOperator?: string | null;
 isAirplaneModeOn?: boolean | null;
 isBluetoothOn?: boolean | null;
 isVpnActive?: boolean | null;
 isMediaPlaying?: boolean | null;
 isHeadphonesConnected?: boolean | null;
 volumeLevel?: number | null;
 volumeMax?: number | null;
 volumePercent?: number | null;
 clipboardText?: string | null;
 clipboardCapturedAt?: number | null;
 trigger?: string | null;
}
