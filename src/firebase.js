// Fresh Firebase Production Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Fresh Production Firebase Initialized Successfully!");

// Export Auth actions wrapper
export const authActions = {
  isMock: false,
  onStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
  signIn: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signUp: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  signOutUser: () => {
    return signOut(auth);
  },
  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Firebase Google Sign In Error:", err);
      throw err;
    }
  },
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// Export Firestore database actions wrapper
export const dbActions = {
  fetchUserDocs: async (userId) => {
    if (!userId) return [];
    try {
      const q = query(collection(db, "documents"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const docsList = [];
      querySnapshot.forEach((doc) => {
        docsList.push({ id: doc.id, ...doc.data() });
      });
      return docsList;
    } catch (e) {
      console.error("Firestore fetchUserDocs error:", e);
      return [];
    }
  },
  saveDoc: async (userId, documentData) => {
    if (!userId) return documentData;
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        userId,
        ...documentData,
        uploadedAt: new Date().toLocaleDateString()
      });
      return { id: docRef.id, ...documentData };
    } catch (e) {
      console.error("Firestore saveDoc error:", e);
      throw e;
    }
  },
  deleteDoc: async (docId) => {
    if (!docId) return;
    try {
      await deleteDoc(doc(db, "documents", docId));
    } catch (e) {
      console.error("Firestore deleteDoc error:", e);
      throw e;
    }
  }
};
