import { auth } from "../firebase";

export const getCurrentUser = () => {
  return auth.currentUser?.displayName || auth.currentUser?.email || "guest";
};