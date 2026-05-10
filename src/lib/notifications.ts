// Foreground-only notification engine.
// These notifications fire only while the app is active in the browser.
// Background delivery is not possible without a push server.

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  // Note: must only be called from a user gesture (button click).
  const result = await Notification.requestPermission();
  return result === 'granted';
};

const canNotify = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  Notification.permission === 'granted';

export const sendLocalNotification = (title: string, body: string) => {
  if (!canNotify()) return;
  try {
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
    });
  } catch {
    // Silently fail — some browsers block programmatic Notification on mobile
  }
};

export const notifyWelcomeBack = () =>
  sendLocalNotification('Sovereign. Your empire awaits.', 'Log your day. Protect your rank.');

export const notifyViceCheck = () =>
  sendLocalNotification('Is the urge creeping in?', 'The Vault is empty. Keep it that way.');

export const notifyEndOfDay = () =>
  sendLocalNotification('Day ends soon.', 'Log your victories before midnight to protect your rank.');
