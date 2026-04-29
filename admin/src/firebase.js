// admin/src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANpku-KNyK1EeZGmOcGuhRdMluBKWoDMg",
  authDomain: "tttn2026-163fc.firebaseapp.com",
  projectId: "tttn2026-163fc",
  storageBucket: "tttn2026-163fc.appspot.com",
  messagingSenderId: "136275542890",
  appId: "1:136275542890:web:94272e92645c41c6671b13",
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
