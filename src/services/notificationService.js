import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
  orderBy,
} from "firebase/firestore";

// 🔔 CREATE NOTIFICATION
export const createNotification = async (data) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userEmail: data.userEmail,
      title: data.title || "Notification",
      message: data.message || "",
      type: data.type || "general",
      relatedTo: data.relatedTo || "",
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Create notification error:", error);
  }
};

// SEND NOTIFICATION WRAPPER
export const sendNotification = async (userEmail, message, type = "general") => {
  return createNotification({
    userEmail,
    message,
    type,
  });
};

// 👀 GET NOTIFICATIONS
export const getNotifications = async (userEmail) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userEmail", "==", userEmail),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error("Get notifications error:", error);
    return [];
  }
};

// 👀 SUBSCRIBE TO NOTIFICATIONS REAL-TIME
export const subscribeNotifications = (userEmail, callback) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userEmail", "==", userEmail),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(notifications);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Subscribe notifications error:", error);
    return () => {};
  }
};

// ALIAS FOR BACKWARD COMPATIBILITY
export const listenNotifications = subscribeNotifications;

// ✓ MARK AS READ
export const markAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Mark as read error:", error);
  }
};

// 🗑️ DELETE NOTIFICATION
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (error) {
    console.error("Delete notification error:", error);
  }
};

// ✓ MARK ALL AS READ
export const markAllAsRead = async (userEmail) => {
  try {
    const notifications = await getNotifications(userEmail);
    const unreadNotifications = notifications.filter((n) => !n.read);

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  } catch (error) {
    console.error("Mark all as read error:", error);
  }
};