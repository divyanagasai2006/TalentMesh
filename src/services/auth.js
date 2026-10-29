import { auth, db, firebaseConfigError, firebaseReady } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const ensureFirebaseReady = () => {
  if (!firebaseReady) {
    throw new Error(
      firebaseConfigError ||
        "Firebase is not configured. Check the VITE_FIREBASE_* values in .env.local.",
    );
  }
};

const getReadableError = (error) => {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/operation-not-allowed":
      "Email/password sign-in is not enabled in Firebase Authentication.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/user-not-found": "Email or password is incorrect.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/wrong-password": "Email or password is incorrect.",
  };
  return messages[code] || error?.message || "Authentication failed.";
};

const buildUserProfile = (firebaseUser, options = {}) => ({
  uid: firebaseUser.uid,
  name:
    options.name ||
    firebaseUser.displayName ||
    firebaseUser.email?.split("@")[0] ||
    "TalentMesh User",
  email: firebaseUser.email || options.email || "",
  role: (options.role || "student").toLowerCase(),
  bio: options.bio || "",
  skills: options.skills || [],
  education: options.education || "",
  interests: options.interests || [],
  headline: options.headline || "",
  photoURL: firebaseUser.photoURL || "",
});

export const ensureUserProfile = async (firebaseUser, defaults = {}) => {
  ensureFirebaseReady();
  const userRef = doc(db, "users", firebaseUser.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    return { uid: firebaseUser.uid, ...existing.data() };
  }

  const profile = buildUserProfile(firebaseUser, defaults);
  await setDoc(
    userRef,
    {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return profile;
};

export const registerWithEmail = async (email, password, options = {}) => {
  try {
    ensureFirebaseReady();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const profile = await ensureUserProfile(userCredential.user, {
      ...options,
      email,
      role: options.role || "student",
    });
    return { firebaseUser: userCredential.user, profile };
  } catch (error) {
    throw new Error(getReadableError(error));
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    ensureFirebaseReady();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const profile = await ensureUserProfile(userCredential.user);
    return { firebaseUser: userCredential.user, profile };
  } catch (error) {
    throw new Error(getReadableError(error));
  }
};

export const updateUserProfile = async (uid, updates) => {
  ensureFirebaseReady();
  await setDoc(
    doc(db, "users", uid),
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const getUserProfile = async (uid) => {
  ensureFirebaseReady();
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
};

export const logout = async () => {
  if (!auth) return;
  await signOut(auth);
};
