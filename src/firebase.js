// src/firebase.js
// Firebase is only used for push notifications and is optional: when the VITE_FIREBASE_* variables
// are not set (or the browser does not support push messaging), `messaging` is null and the rest
// of the app keeps working.
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = ['apiKey', 'projectId', 'messagingSenderId', 'appId']
  .every((key) => Boolean(firebaseConfig[key]));

let messaging = null;

if (isConfigured && typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
  try {
    messaging = getMessaging(initializeApp(firebaseConfig));
  } catch (error) {
    console.warn('Firebase messaging is unavailable:', error);
  }
} else if (!isConfigured) {
  console.info('Firebase is not configured (VITE_FIREBASE_*); push notifications are disabled.');
}

export { messaging, getToken, onMessage };
