// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkZj52296ryqYDeuRL-H6DfBSdoS4VewE",
  authDomain: "student-assignment-remin-7c728.firebaseapp.com",
  projectId: "student-assignment-remin-7c728",
  storageBucket: "student-assignment-remin-7c728.firebasestorage.app",
  messagingSenderId: "898510466078",
  appId: "1:898510466078:web:a4b32c644770cecd6c120f",
  measurementId: "G-P5BLEQ8CKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);