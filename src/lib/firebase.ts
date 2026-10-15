// @ts-nocheck
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFA9LqkQrl4ryc1_rbndDQb_ZaFPRtIk8",
  authDomain: "frameluweddings.firebaseapp.com",
  projectId: "frameluweddings",
  storageBucket: "frameluweddings.firebasestorage.app",
  messagingSenderId: "845188195256",
  appId: "1:845188195256:web:5e53f724cd7c9b7ba6e54d",
  measurementId: "G-BLCJK95ZEC"
};

// Initialize Firebase (SSR-safe singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

