import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZUbEDX4xbr1QQtii3sQzFLrCDZwk-Vi0",
  authDomain: "ez1smeta-app.firebaseapp.com",
  projectId: "ez1smeta-app",
  storageBucket: "ez1smeta-app.firebasestorage.app",
  messagingSenderId: "95234761924",
  appId: "1:95234761924:web:67b744b8374722e3c81591"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
