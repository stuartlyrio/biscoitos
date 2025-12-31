// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnjSKpt1h5Dx8bCLOCcThKcs-18r8XtwQ",
  authDomain: "vitrine-biscoitos.firebaseapp.com",
  projectId: "vitrine-biscoitos",
  storageBucket: "vitrine-biscoitos.firebasestorage.app",
  messagingSenderId: "736029515194",
  appId: "1:736029515194:web:c9309bfc80889e975fd183"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, doc, updateDoc, setDoc, signInWithEmailAndPassword, onAuthStateChanged, signOut };