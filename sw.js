// Myra App — Service Worker
// Enables background notifications even when app is closed

const CACHE_NAME = 'myra-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const action = e.action;
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(clientList => {
      // Focus existing window or open new one
      for(const client of clientList){
        if(client.url && 'focus' in client) return client.focus();
      }
      if(clients.openWindow) return clients.openWindow('./');
    })
  );
});

// Listen for messages from the app to schedule notifications
self.addEventListener('message', e => {
  if(e.data?.type === 'SCHEDULE_NOTIF'){
    const {title, body, tag, delay} = e.data;
    setTimeout(()=>{
      self.registration.showNotification(title, {
        body,
        tag: tag || 'myra-notif',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230a0c12"/><text y=".9em" font-size="80" x="10">💪</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230a0c12"/><text y=".9em" font-size="80" x="10">💪</text></svg>',
        vibrate: [100, 50, 100],
        requireInteraction: false
      });
    }, delay || 0);
  }
});
