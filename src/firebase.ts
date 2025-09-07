// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYYNT2KUNLQP1SE1ZtWQfYnkUshnVyD-M",
  authDomain: "scanner-app-dc473.firebaseapp.com",
  projectId: "scanner-app-dc473",
  storageBucket: "scanner-app-dc473.firebasestorage.app",
  messagingSenderId: "1047384708377",
  appId: "1:1047384708377:web:f870171ad887614775a188",
  measurementId: "G-V98THN8EBX"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize analytics only if supported
const initializeAnalytics = async (): Promise<Analytics | null> => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// Initialize analytics but don't export it directly
initializeAnalytics();

// Initialize and export Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);