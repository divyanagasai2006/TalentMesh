import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { createNotification } from "./notificationService";

// SEND REQUEST
export const sendRequest = async (fromEmail, toEmail, message = "") => {
  try {
    const requestRef = await addDoc(collection(db, "requests"), {
      fromEmail,
      toEmail,
      message,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create notification for recipient
    await createNotification({
      userEmail: toEmail,
      title: "New Collaboration Request",
      message: `${fromEmail} sent you a collaboration request`,
      type: "request",
      relatedTo: requestRef.id,
    });

    return requestRef.id;
  } catch (error) {
    console.error("Send request error:", error);
    throw error;
  }
};

// GET REQUESTS FOR USER
export const getRequests = async (userEmail) => {
  if (!userEmail) {
    return [];
  }

  try {
    const q = query(
      collection(db, "requests"),
      where("toEmail", "==", userEmail)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error("Get requests error:", error);
    return [];
  }
};

// SUBSCRIBE TO REQUESTS REAL-TIME
export const subscribeRequests = (userEmail, callback) => {
  if (!userEmail) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, "requests"),
      where("toEmail", "==", userEmail)
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const requests = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(requests);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Subscribe requests error:", error);
    return () => {};
  }
};

// UPDATE REQUEST STATUS
export const updateRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, "requests", requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    const requestDoc = await getDoc(requestRef);
    if (requestDoc.exists()) {
      const requestData = requestDoc.data();

      await createNotification({
        userEmail: requestData.fromEmail,
        title: status === "accepted" ? "Request Accepted" : "Request Rejected",
        message: `${requestData.toEmail} ${status === "accepted" ? "accepted" : "rejected"} your request`,
        type: "request",
        relatedTo: requestId,
      });
    }

    return true;
  } catch (error) {
    console.error("Update request status error:", error);
    throw error;
  }
};

// DELETE REQUEST
export const deleteRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "requests", requestId));
    return true;
  } catch (error) {
    console.error("Delete request error:", error);
    throw error;
  }
};