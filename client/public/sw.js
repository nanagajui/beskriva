const CACHE_NAME = 'beskriva-v1';
const STATIC_CACHE_NAME = 'beskriva-static-v1';
const DYNAMIC_CACHE_NAME = 'beskriva-dynamic-v1';

// Files to cache immediately (using relative paths for production compatibility)
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// API endpoints that should be cached
const CACHEABLE_API_ENDPOINTS = [
  '/api/models',
  '/api/voices',
];

// Maximum cache size for dynamic content
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_STATIC_CACHE_SIZE = 100;

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip cross-origin requests and external APIs (like Lemonfox.ai)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  const url = new URL(request.url);
  
  // Skip external API calls to prevent interference with Lemonfox.ai
  if (url.hostname !== self.location.hostname) {
    return;
  }

  // Handle internal API requests (if any)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Only cache GET requests for specific endpoints
  if (request.method === 'GET' && CACHEABLE_API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache the response
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
        
        // Limit cache size
        limitCacheSize(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_SIZE);
      }
      
      return networkResponse;
    } catch (error) {
      // If network fails, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline response
      return new Response(
        JSON.stringify({ error: 'Offline - API unavailable' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // For other API requests, just pass through
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Network error' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleStaticRequest(request) {
  try {
    // Try cache first for static files
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Limit cache size
      limitCacheSize(STATIC_CACHE_NAME, MAX_STATIC_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails and it's a navigation request, return the cached index.html
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/index.html');
      if (cachedIndex) {
        return cachedIndex;
      }
    }
    
    // Return offline page or error
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Lemonfox.ai</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Remove oldest entries
    const entriesToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(entriesToDelete.map(key => cache.delete(key)));
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending offline actions
  console.log('Background sync triggered');
  
  // Example: Send queued analytics events, upload cached data, etc.
  try {
    // Implement background sync logic here
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await processQueuedAction(action);
        await removeQueuedAction(action.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getQueuedActions() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['queue'], 'readonly');
    const store = transaction.objectStore('queue');
    return await store.getAll();
  } catch (error) {
    console.error('Failed to get queued actions:', error);
    return [];
  }
}

async function processQueuedAction(action) {
  console.log('Processing queued action:', action);
  
  // Process different types of actions
  switch (action.type) {
    case 'api_request':
      await retryApiRequest(action.data);
      break;
    case 'file_upload':
      await retryFileUpload(action.data);
      break;
    default:
      console.warn('Unknown action type:', action.type);
  }
}

async function removeQueuedAction(actionId) {
  try {
    const db = await openDB();
    const transaction = db.transaction(['queue'], 'readwrite');
    const store = transaction.objectStore('queue');
    await store.delete(actionId);
  } catch (error) {
    console.error('Failed to remove queued action:', error);
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('beskriva-queue', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queue')) {
        const store = db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }
    };
  });
}

async function retryApiRequest(data) {
  try {
    const response = await fetch(data.url, data.options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('API request retried successfully');
  } catch (error) {
    console.error('API request retry failed:', error);
    throw error;
  }
}

async function retryFileUpload(data) {
  try {
    const formData = new FormData();
    formData.append('file', data.file);
    
    const response = await fetch(data.url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('File upload retried successfully');
  } catch (error) {
    console.error('File upload retry failed:', error);
    throw error;
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Lemonfox.ai', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
