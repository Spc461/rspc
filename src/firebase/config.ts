import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: 'AIzaSyCvksPmWtLz4X6w5tWD2AyE2In1y2VP_y4',
  authDomain: 'risingacademy-fd918.firebaseapp.com',
  projectId: 'risingacademy-fd918',
  storageBucket: 'risingacademy-fd918.firebasestorage.app',
  messagingSenderId: '543287545062',
  appId: '1:543287545062:web:a7193e38005c283428bf27',
  measurementId: 'G-46TN14568Z',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
