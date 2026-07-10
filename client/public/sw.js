import { precacheAndRoute } from 'workbox-precaching';

// Yeh lines website ki files ko background me cache/save karengi
precacheAndRoute(self.__WB_MANIFEST || []);

/*
  ─── PUSH NOTIFICATIONS ───────────────────────────────────
  Fires when the backend sends a push message (see
  server/config/webpush.js). The payload is whatever JSON
  object the backend sent — title/body/url are the fields
  this dashboard's push sender always includes.
--------------------------------------------------------------*/
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'VirtualTryOn', body: event.data.text() };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/logo192.png',
    badge: '/logo192.png',
    data: { url: payload.url || '/dashboard' },
    tag: payload.tag || 'default',
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'VirtualTryOn', options)
  );
});

// Clicking the notification focuses an existing dashboard tab if
// one's already open, instead of always opening a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});