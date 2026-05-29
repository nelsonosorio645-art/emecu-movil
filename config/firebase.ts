import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCeS9R02lXOTcxw5zu-1oXWCa3mvDyqDGE",
  authDomain: "eme-de-la-cu.firebaseapp.com",
  projectId: "eme-de-la-cu",
  storageBucket: "eme-de-la-cu.firebasestorage.app",
  messagingSenderId: "184063770528",
  appId: "1:184063770528:web:ef63f6d4dc9963dd256ec5",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export const VERCEL_BASE = "https://maestro-trincado-jet.vercel.app";

export { app, auth, db, storage };
