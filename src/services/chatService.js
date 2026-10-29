import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  where,
  deleteDoc,
} from "firebase/firestore";

// GENERATE CHAT ID FROM TWO USER EMAILS
export const getChatId = (user1Email, user2Email) => {
  return [user1Email, user2Email].sort().join("_");
};

// CREATE CHAT IF NOT EXISTS
export const createChatIfNotExists = async (user1Email, user2Email) => {
  const chatId = getChatId(user1Email, user2Email);
  
  try {
    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [user1Email, user2Email],
        participantNames: [
          user1Email.split("@")[0],
          user2Email.split("@")[0],
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
      },
      { merge: true }
    );
    return chatId;
  } catch (error) {
    console.error("Create chat error:", error);
    throw error;
  }
};

// SEND MESSAGE
export const sendMessage = async (chatId, senderEmail, messageText) => {
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderEmail,
      text: messageText,
      timestamp: serverTimestamp(),
      read: false,
    });

    // Update chat's last message
    await setDoc(
      doc(db, "chats", chatId),
      {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        lastMessageFrom: senderEmail,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  }
};

// SUBSCRIBE TO MESSAGES IN REAL-TIME
export const subscribeMessages = (chatId, callback) => {
  try {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chats", chatId, "messages"),
        orderBy("timestamp", "asc")
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        callback(messages);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("Subscribe messages error:", error);
    return () => {};
  }
};

// SUBSCRIBE TO CHATS LIST (INBOX)
export const subscribeChats = (userEmail, callback) => {
  try {
    const unsubscribe = onSnapshot(
      query(collection(db, "chats")),
      (snapshot) => {
        const chats = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter((c) => c.participants?.includes(userEmail))
          .sort(
            (a, b) => (b.lastMessageTime?.toMillis?.() || 0) - (a.lastMessageTime?.toMillis?.() || 0)
          );
        callback(chats);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("Subscribe chats error:", error);
    return () => {};
  }
};

// DELETE MESSAGE
export const deleteMessage = async (chatId, messageId) => {
  try {
    await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
  } catch (error) {
    console.error("Delete message error:", error);
    throw error;
  }
};

// GET CHAT DETAILS
export const getChatDetails = async (chatId) => {
  try {
    const chatSnap = await getDocs(query(collection(db, "chats"), where("__name__", "==", chatId)));
    
    if (chatSnap.docs.length > 0) {
      return chatSnap.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("Get chat details error:", error);
    return null;
  }
};
