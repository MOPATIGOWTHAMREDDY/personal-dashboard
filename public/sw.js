// Example: a minimal Service Worker for Next.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Optionally, do something on install
});
self.addEventListener('activate', (event) => {
  // Optionally, do something on activate
});
self.addEventListener('fetch', (event) => {
  // Optionally, do something on fetch
});