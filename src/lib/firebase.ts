import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpeH2vp9elXPbxMGwQoIzpnu4o9W0pGcY",
  authDomain: "janaseva-8fed3.firebaseapp.com",
  projectId: "janaseva-8fed3",
  storageBucket: "janaseva-8fed3.firebasestorage.app",
  messagingSenderId: "952848373620",
  appId: "1:952848373620:web:37447575a2ac8efd793e21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
