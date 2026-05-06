// firebase/firestore.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// imong config (pwede later env, pero for now okay ni)
const firebaseConfig = {
  apiKey: "AIzaSyDkZj52296ryqYDeuRL-H6DfBSdoS4VewE",
  authDomain: "student-assignment-remin-7c728.firebaseapp.com",
  projectId: "student-assignment-remin-7c728",
  storageBucket: "student-assignment-remin-7c728.firebasestorage.app",
  messagingSenderId: "898510466078",
  appId: "1:898510466078:web:a4b32c644770cecd6c120f",
};

// prevent multiple initialize (Next.js fix)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// EXPORT DATABASE
export const db = getFirestore(app);