// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getStorage } from 'firebase/storage';
// import { getFirestore } from 'firebase/firestore';

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId:import.meta.env.VITE_FIREBASE_APP_ID, 
//   measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const storage = getStorage(app);
// export const firestore = getFirestore(app);
// export const auth=getAuth(app);
// export { db, storage };




// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-t3hCbzoLuGP2JqUc75qCiyTNDRBXp8M",
  authDomain: "e-kicker.firebaseapp.com",
  projectId:"e-kicker",
  storageBucket: "e-kicker.firebasestorage.app",
  messagingSenderId:  "286842017972",
  appId: "1:286842017972:web:cfd41a0363cae2f6d69fe1",
  measurementId:"G-TJ8RS5CYLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
export const firestore = getFirestore(app);
export const auth=getAuth(app);
export { db, storage };
