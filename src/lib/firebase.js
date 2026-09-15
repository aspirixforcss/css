import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5Y8snmCFNiw3DVUJYVffxKIYqMaA4yI8",
  authDomain: "aspirixforcss.firebaseapp.com",
  projectId: "aspirixforcss",
  storageBucket: "aspirixforcss.firebasestorage.app",
  messagingSenderId: "199752238385",
  appId: "1:199752238385:web:03b4b31f586d5854bc9c10",
  measurementId: "G-3NH5PE5BB3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
