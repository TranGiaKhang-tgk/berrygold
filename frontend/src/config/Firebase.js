import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚙️ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyANpku-KNyK1EeZGm0cGuhRdMuBKWODM9",
  authDomain: "tttn2026-163fc.firebaseapp.com",
  projectId: "tttn2026-163fc",
  storageBucket: "tttn2026-163fc.appspot.com",
  messagingSenderId: "136275542890",
  appId: "1:136275542890:web:94272e92645c41c6671b13",
};

// 🔥 Init app (CHỈ 1 LẦN)
const app = initializeApp(firebaseConfig);

// ✅ Export service để dùng toàn app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// (tuỳ chọn) export app nếu sau này cần
export default app;
