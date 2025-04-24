import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyCtu4LeFyIlGVUQdBHmvXu5-DJtMF81JL8",
  authDomain: "pebblypal.firebaseapp.com",
  projectId: "pebblypal",
  storageBucket: "pebblypal.firebasestorage.app",
  messagingSenderId: "291090871519",
  appId: "1:291090871519:ios:3912bf5250d6938c34656a",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

export { auth };
export default app; 