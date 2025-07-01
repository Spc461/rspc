// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAb51b0FPjEv2UocApwDeb8K9zAHg_TNWg",
  authDomain: "risinga-ebc76.firebaseapp.com",
  projectId: "risinga-ebc76",
  storageBucket: "risinga-ebc76.firebasestorage.app",
  messagingSenderId: "386879187827",
  appId: "1:386879187827:web:44b37ee62346cde6913306",
  measurementId: "G-2KJYKCSYEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);