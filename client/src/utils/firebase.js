import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "remotesync-new.firebaseapp.com",
  projectId: "remotesync-new",
  storageBucket: "remotesync-new.firebasestorage.app",
  messagingSenderId: "603746724851",
  appId: "1:603746724851:web:e0df84b987980e53d4c086"
};
export const app = initializeApp(firebaseConfig);



