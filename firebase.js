import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCv-nithiXDcCDgj4bzbIypVVkPgVkd-A",
  authDomain: "memo-md-c6664.firebaseapp.com",
  databaseURL: "https://memo-md-c6664-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "memo-md-c6664",
  storageBucket: "memo-md-c6664.firebasestorage.app",
  messagingSenderId: "1076325826878",
  appId: "1:1076325826878:web:b8a3738fb562e5c67b2c6f",
  measurementId: "G-QK93EM4XDP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
