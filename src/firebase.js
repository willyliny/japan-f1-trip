import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyIvyDbXYxDuj4qjVQnQ_JN0zE6igaUqU",
  authDomain: "japan-f1-trip.firebaseapp.com",
  projectId: "japan-f1-trip",
  storageBucket: "japan-f1-trip.firebasestorage.app",
  messagingSenderId: "693718641161",
  appId: "1:693718641161:web:368a53ad27b0d5869466d8",
  measurementId: "G-4XK7ZQHTFZ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Expenses (realtime, per-trip collection) ───────────────
// Note: no orderBy in the query — a where + orderBy combo requires a
// composite index per collection. We sort client-side instead so new
// trip collections work out of the box.
export function subscribeExpenses(collName, onData, onError) {
  const q = query(collection(db, collName), where("deleted", "==", false));
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) => ({
        _docId: d.id,
        ...d.data(),
      }));
      expenses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onData(expenses);
    },
    (error) => {
      console.error("Expenses sync error:", error);
      onError?.(error);
    }
  );
}

export async function addExpense(collName, expense) {
  await addDoc(collection(db, collName), {
    ...expense,
    deleted: false,
    createdAt: Date.now(),
  });
}

export async function updateExpense(collName, docId, data) {
  const ref = doc(db, collName, docId);
  await updateDoc(ref, data);
}

// Soft delete — safe for concurrent use
export async function deleteExpense(collName, docId) {
  const ref = doc(db, collName, docId);
  await updateDoc(ref, { deleted: true });
}

// ─── Settings (realtime, per-trip doc) ──────────────────────
export function subscribeSettings(docKey, callback, defaultRate = 0.22) {
  const ref = doc(db, "settings", docKey);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        setDoc(ref, { jpyToTwd: defaultRate });
        callback({ jpyToTwd: defaultRate });
      }
    },
    (error) => {
      console.error("Settings sync error:", error);
    }
  );
}

export async function updateSetting(docKey, key, value) {
  const ref = doc(db, "settings", docKey);
  await setDoc(ref, { [key]: value }, { merge: true });
}
