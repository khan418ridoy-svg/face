import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBd2xIZ9sB8P0Hqj5PyzDcX9DMsU5cVSEA",
  authDomain: "face-5733a.firebaseapp.com",
  projectId: "face-5733a",
  storageBucket: "face-5733a.firebasestorage.app",
  messagingSenderId: "768380864288",
  appId: "1:768380864288:web:b0b207b7090f236b227945",
  measurementId: "G-MKZD9C1EXZ"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { collection, addDoc, getDocs };
