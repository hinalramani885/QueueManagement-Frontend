// Central place for backend URLs.
//
// By default the app talks to the backend through same-origin paths ("/api", "/ws", "/uploads"):
//  - in development the Vite dev server proxies them to the backend (see vite.config.js)
//  - in Docker, nginx proxies them to the backend container (see nginx.conf)
// Set VITE_BACKEND_URL (e.g. https://api.example.com) only if the backend lives on another origin.

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

/** The one QFlow contact address shown everywhere in the app (footer, legal pages, docs). */
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'qflowapplication@gmail.com';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${BACKEND_URL}/api`;

// SockJS endpoint (relative URLs are resolved against the current page)
export const WS_URL = import.meta.env.VITE_WS_URL || `${BACKEND_URL}/ws`;

/** Turns a backend-relative path such as "/uploads/abc.png" into a URL the browser can load. */
export const backendUrl = (path) => {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
