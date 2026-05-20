import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2MYu1y3gH66NYQ1hA58qJvSe9FCsU6VY",
  authDomain: "bingo-6a6e4.firebaseapp.com",
  projectId: "bingo-6a6e4",
  storageBucket: "bingo-6a6e4.firebasestorage.app",
  messagingSenderId: "391288219692",
  appId: "1:391288219692:web:6253f4605a13b85afb0989"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with multi-tab persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { db };
