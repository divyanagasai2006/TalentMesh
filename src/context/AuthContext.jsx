import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  ensureUserProfile,
  loginWithEmail,
  registerWithEmail,
} from "../services/auth";
import { subscribeCurrentUserProfile } from "../services/platformService";
import { firebaseReady } from "../firebase";
import { AuthContext } from "./authState";

const AUTH_STORAGE_KEYS = ["isLoggedIn", "userEmail", "userId", "userRole"];

const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const persistSession = (profile, currentUser) => {
    const nextUser = {
      uid: currentUser.uid,
      email: currentUser.email || profile.email || "",
      ...profile,
    };

    setUser(nextUser);
    setFirebaseUser(currentUser);
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", nextUser.email || "");
    localStorage.setItem("userId", nextUser.uid || "");
    localStorage.setItem("userRole", nextUser.role || "student");
  };

  const clearSession = () => {
    setUser(null);
    setFirebaseUser(null);
    setIsLoggedIn(false);
    clearAuthStorage();
  };

  useEffect(() => {
    if (!auth) {
      clearSession();
      setLoading(false);
      return undefined;
    }

    let profileUnsubscribe = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      profileUnsubscribe();

      if (!currentUser) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const profile = await ensureUserProfile(currentUser);
        persistSession(profile, currentUser);

        if (firebaseReady) {
          profileUnsubscribe = subscribeCurrentUserProfile(currentUser.uid, (liveProfile) => {
            if (liveProfile) {
              persistSession(liveProfile, currentUser);
            }
          });
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        clearSession();
      } finally {
        setLoading(false);
      }
    });

    return () => {
      profileUnsubscribe();
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { firebaseUser: signedInUser, profile } = await loginWithEmail(
      email,
      password,
    );
    persistSession(profile, signedInUser);
    return profile;
  };

  const register = async (email, password, options = {}) => {
    const { firebaseUser: createdUser, profile } = await registerWithEmail(
      email,
      password,
      options,
    );
    persistSession(profile, createdUser);
    return profile;
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    clearSession();
  };

  const updateUserProfile = (updates) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  };

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      isLoggedIn,
      login,
      register,
      logout,
      updateUserProfile,
    }),
    [user, firebaseUser, loading, isLoggedIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
