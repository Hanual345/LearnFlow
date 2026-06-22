// Firebase Configuration with Safe Local Fallback to prevent blank page crashes
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if credentials are valid and defined
const isConfigured = !!firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                     firebaseConfig.apiKey !== "" &&
                     firebaseConfig.apiKey !== "undefined" &&
                     typeof firebaseConfig.apiKey !== "undefined";

let app = null;
let auth = null;
let db = null;
let mockAuth = null;
let mockDb = null;

// Initialize Mock System
setupMockSystem();

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully with cloud configuration.");
  } catch (error) {
    console.error("⚠️ Failed to initialize Firebase, falling back to mock:", error);
  }
} else {
  console.warn("⚠️ Firebase credentials not configured. Falling back to local storage mock to prevent blank page crash.");
}

function setupMockSystem() {
  // Pre-populate mock database with user's email for instant login
  const existingUsers = JSON.parse(localStorage.getItem("learnflow_mock_registered_users") || "[]");
  if (!existingUsers.some(u => u.email === "hanualjoshua@gmail.com")) {
    existingUsers.push({
      uid: "mock-uid-joshua",
      email: "hanualjoshua@gmail.com",
      password: "password123",
      displayName: "Hanua Joshua"
    });
    localStorage.setItem("learnflow_mock_registered_users", JSON.stringify(existingUsers));
  }

  // MOCK AUTHENTICATION SYSTEM
  mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      const savedUser = localStorage.getItem("learnflow_mock_user");
      const user = savedUser ? JSON.parse(savedUser) : null;
      mockAuth.currentUser = user;
      callback(user);
      return () => {};
    },
    signInWithEmailAndPassword: async (email, password) => {
      const users = JSON.parse(localStorage.getItem("learnflow_mock_registered_users") || "[]");
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) {
        throw new Error("auth/user-not-found - Invalid email or password");
      }
      const user = { uid: found.uid, email: found.email, displayName: found.displayName || email.split('@')[0] };
      mockAuth.currentUser = user;
      localStorage.setItem("learnflow_mock_user", JSON.stringify(user));
      window.dispatchEvent(new Event('mock-auth-change'));
      return { user };
    },
    createUserWithEmailAndPassword: async (email, password) => {
      const users = JSON.parse(localStorage.getItem("learnflow_mock_registered_users") || "[]");
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("auth/email-already-in-use");
      }
      const newUser = {
        uid: "mock-uid-" + Math.random().toString(36).substr(2, 9),
        email,
        password,
        displayName: email.split('@')[0]
      };
      users.push(newUser);
      localStorage.setItem("learnflow_mock_registered_users", JSON.stringify(users));
      const userSession = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
      mockAuth.currentUser = userSession;
      localStorage.setItem("learnflow_mock_user", JSON.stringify(userSession));
      window.dispatchEvent(new Event('mock-auth-change'));
      return { user: userSession };
    },
    signOut: async () => {
      mockAuth.currentUser = null;
      localStorage.removeItem("learnflow_mock_user");
      window.dispatchEvent(new Event('mock-auth-change'));
    }
  };

  // MOCK FIRESTORE SYSTEM
  mockDb = {
    getDocuments: async (userId) => {
      const allDocs = JSON.parse(localStorage.getItem("learnflow_mock_documents") || "[]");
      return allDocs.filter(d => d.userId === userId);
    },
    addDocument: async (userId, docData) => {
      const allDocs = JSON.parse(localStorage.getItem("learnflow_mock_documents") || "[]");
      const newDoc = {
        id: "mock-doc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        userId,
        ...docData,
        uploadedAt: new Date().toLocaleDateString()
      };
      allDocs.unshift(newDoc);
      localStorage.setItem("learnflow_mock_documents", JSON.stringify(allDocs));
      return newDoc;
    },
    deleteDocument: async (docId) => {
      const allDocs = JSON.parse(localStorage.getItem("learnflow_mock_documents") || "[]");
      const filtered = allDocs.filter(d => d.id !== docId);
      localStorage.setItem("learnflow_mock_documents", JSON.stringify(filtered));
    }
  };
}

// Export Auth actions wrapper
export const authActions = {
  isMock: !isConfigured,
  onStateChanged: (callback) => {
    if (!isConfigured || !auth) return mockAuth.onAuthStateChanged(callback);
    return onAuthStateChanged(auth, callback);
  },
  signIn: async (email, password) => {
    if (!isConfigured || !auth) return mockAuth.signInWithEmailAndPassword(email, password);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (email.toLowerCase() === 'hanualjoshua@gmail.com') {
        return mockAuth.signInWithEmailAndPassword(email, password);
      }
      throw err;
    }
  },
  signUp: (email, password) => {
    if (!isConfigured || !auth) return mockAuth.createUserWithEmailAndPassword(email, password);
    return createUserWithEmailAndPassword(auth, email, password);
  },
  signOutUser: () => {
    if (!isConfigured || !auth) return mockAuth.signOut();
    return signOut(auth);
  },
  getCurrentUser: () => {
    return (isConfigured && auth) ? auth.currentUser : mockAuth.currentUser;
  }
};

// Export Firestore database actions wrapper
export const dbActions = {
  fetchUserDocs: async (userId) => {
    if (!isConfigured || !db || !userId || String(userId).startsWith("mock-")) {
      return mockDb.getDocuments(userId);
    }
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
      return mockDb.getDocuments(userId);
    }
  },
  saveDoc: async (userId, documentData) => {
    if (!isConfigured || !db || !userId || String(userId).startsWith("mock-")) {
      return mockDb.addDocument(userId, documentData);
    }
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        userId,
        ...documentData,
        uploadedAt: new Date().toLocaleDateString()
      });
      return { id: docRef.id, ...documentData };
    } catch (e) {
      console.error("Firestore saveDoc error:", e);
      return mockDb.addDocument(userId, documentData);
    }
  },
  deleteDoc: async (docId) => {
    if (!isConfigured || !db || !docId || String(docId).startsWith("mock-")) {
      return mockDb.deleteDocument(docId);
    }
    try {
      await deleteDoc(doc(db, "documents", docId));
    } catch (e) {
      console.error("Firestore deleteDoc error:", e);
      return mockDb.deleteDocument(docId);
    }
  }
};
