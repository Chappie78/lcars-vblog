import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMQoAfmsbjwJTb_rZtoyPQwRIm9gjuZLI",
  authDomain: "lcars-vblog.firebaseapp.com",
  projectId: "lcars-vblog",
  storageBucket: "lcars-vblog.firebasestorage.app",
  messagingSenderId: "1057367328663",
  appId: "1:1057367328663:web:c0210de9d6ea2c6ff6a6d2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);