// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA66kbiB067kuq1EPlAy4bfF4Ub_zgfUY8",
  authDomain: "billing-bansalstore.firebaseapp.com",
  projectId: "billing-bansalstore",
  storageBucket: "billing-bansalstore.appspot.com",
  messagingSenderId: "1093632645305",
  appId: "1:1093632645305:web:382a155662b6d479cde368",
  measurementId: "G-DMTPS70D69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);