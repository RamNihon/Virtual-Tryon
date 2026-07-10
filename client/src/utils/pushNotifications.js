import axios from "axios";
import API_URL from "../api";

/*
  ─── PUSH NOTIFICATION UTILITIES ────────────────────────────
  Handles the browser-side half of push notifications: asking
  permission, subscribing via the Push API, and sending that
  subscription to the backend to store.

  Requires HTTPS (or localhost) and a registered service worker
  — both already true for this app since it's a CRA PWA. Push
  won't work on iOS Safari below iOS 16.4, and Safari in general
  has partial support; the `isPushSupported()` check lets the UI
  hide the toggle gracefully on unsupported browsers instead of
  showing something that silently fails.
--------------------------------------------------------------*/

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/* Returns the current permission + subscription state so the
   Settings UI can show the right toggle position on load. */
export async function getPushStatus() {
  if (!isPushSupported()) return { supported: false };

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  return {
    supported: true,
    permission: Notification.permission, // "default" | "granted" | "denied"
    subscribed: !!subscription,
  };
}

/* Asks the browser for permission, creates a subscription, and
   saves it on the backend against the logged-in seller. */
export async function enablePushNotifications(token) {
  if (!isPushSupported()) {
    throw new Error("Push notifications aren't supported on this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const { data } = await axios.get(`${API_URL}/api/push/vapid-public-key`);
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey),
  });

  await axios.post(`${API_URL}/api/push/subscribe`, subscription.toJSON(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return true;
}

/* Unsubscribes locally and tells the backend to forget this
   device's subscription. */
export async function disablePushNotifications(token) {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await axios.post(
      `${API_URL}/api/push/unsubscribe`,
      { endpoint: subscription.endpoint },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await subscription.unsubscribe();
  }
}