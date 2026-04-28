import { NotificationPermissionState } from "./types";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionState(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  const permission = await Notification.requestPermission();
  return permission;
}
