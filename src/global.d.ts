declare interface NotificationOptions {
  renotify?: boolean;
  actions?: NotificationAction[];
  vibrate?: number[];
}

declare interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}