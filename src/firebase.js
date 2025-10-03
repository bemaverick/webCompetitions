// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyBD2xxjlmDY29x56Cj_cSqNt4UirBWRN4o',
  //apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: "popeye-arm.firebaseapp.com",
  databaseURL: "https://popeye-arm.firebaseio.com",
  projectId: "popeye-arm",
  storageBucket: "popeye-arm.appspot.com",
  messagingSenderId: "314021917217",
  appId: "1:314021917217:web:840e2dacd272f5cea62960",
  measurementId: "G-4587CJWXHH"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firestoreDB = getFirestore(firebaseApp);
const analytics = getAnalytics(firebaseApp);