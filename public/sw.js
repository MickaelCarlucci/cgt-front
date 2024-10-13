self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('next-pwa').then(cache => {
      return cache.addAll([
        '/', // La page d'accueil
        '/manifest.json',
        '/assets/icons/icon-192x192.png',
        '/assets/icons/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // On exclut les requêtes vers les API d'authentification
  if (request.url.includes('/api/users/signin') || request.url.includes('/api/users/refresh-token')) {
    event.respondWith(fetch(request)); // On ne les met jamais en cache
    return;
  }

  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(networkResponse => {
          return caches.open('next-pwa').then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Stratégie "network-first" pour tout le reste
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

self.addEventListener('push', function(event) {
  const data = event.data.json();  // Les données envoyées via l'API Push
  
  const options = {
    body: data.body,
    icon: data.icon || '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
