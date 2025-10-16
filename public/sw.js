// Service Worker for Case Index RT
const CACHE_NAME = 'case-index-rt-v3'
const STATIC_CACHE = 'static-v3'
const DYNAMIC_CACHE = 'dynamic-v3'

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/search',
  '/calendar',
  '/analytics',
  '/notifications',
  '/documents',
  '/billing',
  '/account',
  '/help',
  '/manifest.json'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    // Clear all old caches first
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('SW: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Now cache the new files
      return caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('Caching static files')
          return cache.addAll(STATIC_FILES)
        })
    }).then(() => {
      console.log('Static files cached successfully')
      return self.skipWaiting()
    }).catch((error) => {
        console.error('Failed to cache static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', request.url)
          return cachedResponse
        }
        
        // Fetch from network and cache for future use
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Clone the response for caching
            const responseToCache = response.clone()
            
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })
            
            return response
          })
          .catch((error) => {
            console.error('Fetch failed:', error)
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/')
            }
            
            throw error
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'case-search') {
    event.waitUntil(
      // Handle offline case searches
      handleOfflineCaseSearch()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New case update available',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Case',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Case Index RT', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/search')
    )
  }
})

// Helper function for offline case search
async function handleOfflineCaseSearch() {
  try {
    // Get offline searches from IndexedDB
    const offlineSearches = await getOfflineSearches()
    
    for (const search of offlineSearches) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/cases/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(search)
        })
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineSearch(search.id)
        }
      } catch (error) {
        console.error('Failed to sync offline search:', error)
      }
    }
  } catch (error) {
    console.error('Failed to handle offline searches:', error)
  }
}

// IndexedDB helpers (simplified)
async function getOfflineSearches() {
  // This would interact with IndexedDB
  // For now, return empty array
  return []
}

async function removeOfflineSearch(id) {
  // This would remove from IndexedDB
  console.log('Removing offline search:', id)
}