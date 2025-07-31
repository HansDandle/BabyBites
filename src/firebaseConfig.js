// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
// You can find this in your Firebase project settings -> Project settings -> Your apps -> Web app -> Firebase SDK snippet -> Config
const firebaseConfig = {
  apiKey: "AIzaSyCeyN_rMIUCVeLQovJAqPo4UhC7hw9rSao",
  authDomain: "babybites-9e048.firebaseapp.com",
  projectId: "babybites-9e048",
  storageBucket: "babybites-9e048.firebasestorage.app",
  messagingSenderId: "727702036406",
  appId: "1:727702036406:web:c4c0146caf045e515bab17",
  measurementId: "G-4R9E30X9E4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
