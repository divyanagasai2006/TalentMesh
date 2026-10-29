import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || "",
};

let app;
let db;
let auth;
let firebaseConfigError = "";

const requiredConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingConfigKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);

try {
  if (missingConfigKeys.length > 0) {
    throw new Error(`Missing Firebase config: ${missingConfigKeys.join(", ")}`);
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  firebaseConfigError = error.message;
  console.warn("Firebase initialization warning:", firebaseConfigError);
}

const firebaseReady = Boolean(app && auth && db);

export { db, auth, app, firebaseReady, firebaseConfigError };
