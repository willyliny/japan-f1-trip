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
  orderBy,
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

// ─── Expenses (realtime) ────────────────────────────────────
const expensesRef = collection(db, "expenses");

// Listen to all non-deleted expenses, ordered by creation
export function subscribeExpenses(callback) {
  const q = query(
    expensesRef,
    where("deleted", "==", false),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) => ({
        _docId: d.id,
        ...d.data(),
      }));
      callback(expenses);
    },
    (error) => {
      console.error("Expenses sync error:", error);
    }
  );
}

export async function addExpense(expense) {
  await addDoc(expensesRef, {
    ...expense,
    deleted: false,
    createdAt: Date.now(),
  });
}

// Soft delete — safe for concurrent use
export async function deleteExpense(docId) {
  const ref = doc(db, "expenses", docId);
  await updateDoc(ref, { deleted: true });
}

// ─── Settings (realtime) ────────────────────────────────────
const settingsRef = doc(db, "settings", "global");

export function subscribeSettings(callback) {
  return onSnapshot(
    settingsRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        setDoc(settingsRef, { jpyToTwd: 0.22 });
        callback({ jpyToTwd: 0.22 });
      }
    },
    (error) => {
      console.error("Settings sync error:", error);
    }
  );
}

export async function updateSetting(key, value) {
  await setDoc(settingsRef, { [key]: value }, { merge: true });
}
