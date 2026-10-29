import { db, firebaseReady, firebaseConfigError } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const COLLECTIONS = {
  users: "users",
  connections: "connections",
  connectionRequests: "connectionRequests",
  notifications: "notifications",
  chats: "chats",
  opportunities: "opportunities",
  applications: "applications",
  projects: "projects",
  announcements: "announcements",
  skills: "skills",
  learningResources: "learningResources",
  userActivity: "userActivity",
};

export const isPlatformReady = () => firebaseReady && Boolean(db);

const ensureReady = () => {
  if (!firebaseReady || !db) {
    throw new Error(
      firebaseConfigError ||
        "Firebase is not configured. Please check your VITE_FIREBASE_* environment variables.",
    );
  }
};

const toMillis = (value) => {
  const date = safeDate(value);
  return date ? date.getTime() : 0;
};

const sortByCreatedAtDesc = (items) =>
  [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

const sortByNameAsc = (items) =>
  [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

const mapSnapshot = (snapshot) =>
  snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

const safeDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  return new Date(value);
};

export const formatDate = (value, options = {}) => {
  const date = safeDate(value);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: options.includeTime ? "short" : undefined,
  }).format(date);
};

const normalizeUser = (id, data) => ({
  id,
  uid: data.uid || id,
  name: data.name || data.displayName || data.email?.split("@")[0] || "TalentMesh User",
  email: data.email || "",
  role: (data.role || "student").toLowerCase(),
  bio: data.bio || "",
  skills: data.skills || data.talents || [],
  education: data.education || "",
  interests: data.interests || [],
  photoURL: data.photoURL || data.avatar || "",
  headline: data.headline || "",
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  ...data,
});

export const getUserDocumentRef = (uid) => doc(db, COLLECTIONS.users, uid);

export const getUserProfileById = async (uid) => {
  ensureReady();
  const snap = await getDoc(getUserDocumentRef(uid));
  if (!snap.exists()) return null;
  return normalizeUser(snap.id, snap.data());
};

export const updateCurrentUserProfile = async (uid, updates) => {
  ensureReady();
  await setDoc(
    getUserDocumentRef(uid),
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const subscribeCollection = (q, callback, onError) => {
  try {
    ensureReady();
  } catch (error) {
    console.error("[TalentMesh] Firebase not ready:", error.message);
    callback([]);
    if (onError) onError(error);
    return () => {};
  }

  return onSnapshot(
    q,
    (snapshot) => callback(mapSnapshot(snapshot)),
    (error) => {
      console.error("[TalentMesh] Firestore subscription error:", error.code, error.message);
      if (onError) onError(error);
      callback([]);
    },
  );
};

export const subscribeCurrentUserProfile = (uid, callback) => {
  try {
    ensureReady();
  } catch (error) {
    console.error("[TalentMesh] Profile subscription failed:", error.message);
    callback(null);
    return () => {};
  }
  return onSnapshot(
    getUserDocumentRef(uid),
    (snap) => {
      callback(snap.exists() ? normalizeUser(snap.id, snap.data()) : null);
    },
    (error) => {
      console.error("[TalentMesh] Profile snapshot error:", error.message);
      callback(null);
    },
  );
};

export const subscribeNotifications = (uid, callback) => {
  ensureReady();
  const q = query(
    collection(db, COLLECTIONS.notifications),
    where("recipientId", "==", uid),
  );
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const createNotification = async ({ recipientId, type, title, message, data = {} }) => {
  ensureReady();
  if (!recipientId) return;
  await addDoc(collection(db, COLLECTIONS.notifications), {
    recipientId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: serverTimestamp(),
  });
};

export const markNotificationRead = async (notificationId) => {
  ensureReady();
  await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
    read: true,
    updatedAt: serverTimestamp(),
  });
};

export const markAllNotificationsRead = async (uid) => {
  ensureReady();
  const q = query(collection(db, COLLECTIONS.notifications), where("recipientId", "==", uid));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((notificationDoc) => {
    batch.update(notificationDoc.ref, { read: true, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

export const subscribeStudents = (callback) => {
  ensureReady();
  const q = query(collection(db, COLLECTIONS.users), where("role", "==", "student"));
  return subscribeCollection(q, (docs) => callback(docs.map((item) => normalizeUser(item.id, item))));
};

export const subscribeAnnouncements = (callback) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.announcements);
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const createAnnouncement = async (announcement) => {
  ensureReady();
  const docRef = await addDoc(collection(db, COLLECTIONS.announcements), {
    ...announcement,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const studentSnap = await getDocs(
    query(collection(db, COLLECTIONS.users), where("role", "==", "student")),
  );
  const batch = writeBatch(db);
  studentSnap.docs.forEach((studentDoc) => {
    const notificationRef = doc(collection(db, COLLECTIONS.notifications));
    batch.set(notificationRef, {
      recipientId: studentDoc.id,
      type: "announcement",
      title: announcement.title || "New announcement",
      message: announcement.message || "A new campus announcement was published.",
      data: { announcementId: docRef.id },
      read: false,
      createdAt: serverTimestamp(),
    });
  });
  try {
    await batch.commit();
  } catch (error) {
    console.warn("[TalentMesh] Announcement notification batch failed:", error.message);
  }
  return docRef.id;
};

export const subscribeOpportunities = (callback, filters = {}) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.opportunities);
  return subscribeCollection(q, (items) => {
    let result = sortByCreatedAtDesc(items);
    if (filters.type && filters.type !== "all") {
      result = result.filter((item) => item.type === filters.type);
    }
    callback(result);
  });
};

export const createOpportunity = async (opportunity, adminUser) => {
  ensureReady();
  const docRef = await addDoc(collection(db, COLLECTIONS.opportunities), {
    ...opportunity,
    postedById: adminUser.uid,
    postedByName: adminUser.name,
    postedByEmail: adminUser.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const studentSnap = await getDocs(query(collection(db, COLLECTIONS.users), where("role", "==", "student")));
  const batch = writeBatch(db);
  studentSnap.docs.forEach((studentDoc) => {
    const notificationRef = doc(collection(db, COLLECTIONS.notifications));
    batch.set(notificationRef, {
      recipientId: studentDoc.id,
      type: "opportunity",
      title: "New opportunity posted",
      message: `${opportunity.title} is now available on TalentMesh.`,
      data: { opportunityId: docRef.id, opportunityType: opportunity.type },
      read: false,
      createdAt: serverTimestamp(),
    });
  });
  try {
    await batch.commit();
  } catch (error) {
    console.warn("[TalentMesh] Opportunity notification batch failed:", error.message);
  }
  return docRef.id;
};

export const toggleBookmarkOpportunity = async (opportunityId, uid) => {
  ensureReady();
  const bookmarkId = `${uid}_${opportunityId}`;
  const bookmarkRef = doc(db, "bookmarks", bookmarkId);
  const bookmarkSnap = await getDoc(bookmarkRef);
  if (bookmarkSnap.exists()) {
    await deleteDoc(bookmarkRef);
    return false;
  }
  await setDoc(bookmarkRef, {
    userId: uid,
    opportunityId,
    createdAt: serverTimestamp(),
  });
  return true;
};

export const subscribeBookmarks = (uid, callback) => {
  ensureReady();
  const q = query(collection(db, "bookmarks"), where("userId", "==", uid));
  return subscribeCollection(q, callback);
};

export const applyToOpportunity = async ({ opportunity, student, note = "" }) => {
  ensureReady();
  const existing = await getDocs(
    query(collection(db, COLLECTIONS.applications), where("studentId", "==", student.uid)),
  );

  const alreadyApplied = existing.docs.some(
    (docSnap) => docSnap.data().opportunityId === opportunity.id,
  );

  if (alreadyApplied) {
    throw new Error("You have already applied to this opportunity.");
  }

  const applicationRef = await addDoc(collection(db, COLLECTIONS.applications), {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    opportunityType: opportunity.type,
    studentId: student.uid,
    studentName: student.name,
    studentEmail: student.email,
    studentSkills: student.skills || [],
    studentBio: student.bio || "",
    note,
    status: "Pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    recipientId: opportunity.postedById,
    type: "application",
    title: "New application received",
    message: `${student.name} applied to ${opportunity.title}.`,
    data: { applicationId: applicationRef.id, opportunityId: opportunity.id },
  });

  return applicationRef.id;
};

export const subscribeStudentApplications = (uid, callback) => {
  ensureReady();
  const q = query(
    collection(db, COLLECTIONS.applications),
    where("studentId", "==", uid),
  );
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const subscribeAdminApplications = (callback) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.applications);
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const updateApplicationStatus = async (applicationId, status) => {
  ensureReady();
  const applicationRef = doc(db, COLLECTIONS.applications, applicationId);
  const applicationSnap = await getDoc(applicationRef);
  if (!applicationSnap.exists()) throw new Error("Application not found.");
  const application = applicationSnap.data();
  await updateDoc(applicationRef, {
    status,
    updatedAt: serverTimestamp(),
  });
  await createNotification({
    recipientId: application.studentId,
    type: "application",
    title: `Application ${status.toLowerCase()}`,
    message: `Your application for ${application.opportunityTitle} is now ${status}.`,
    data: { applicationId, opportunityId: application.opportunityId },
  });
};

export const createConnectionRequest = async (fromUser, toUser) => {
  ensureReady();
  if (!fromUser?.uid || !toUser?.uid) throw new Error("Invalid users for connection request.");
  if (fromUser.uid === toUser.uid) throw new Error("You cannot connect with yourself.");

  const existingAccepted = await getDocs(
    query(
      collection(db, COLLECTIONS.connections),
      where("participants", "array-contains", fromUser.uid)
    )
  );
  const isAlreadyConnected = existingAccepted.docs.some((docSnap) => {
    const data = docSnap.data();
    return data.participants?.includes(toUser.uid);
  });

  if (isAlreadyConnected) {
    throw new Error("You are already connected with this student.");
  }

  const existingRequest = await getDocs(
    query(
      collection(db, COLLECTIONS.connectionRequests),
      where("fromUserId", "==", fromUser.uid),
    ),
  );

  const hasPending = existingRequest.docs.some(
    (docSnap) =>
      docSnap.data().toUserId === toUser.uid && docSnap.data().status === "pending",
  );

  if (hasPending) {
    throw new Error("Connection request already sent.");
  }

  const requestRef = await addDoc(collection(db, COLLECTIONS.connectionRequests), {
    fromUserId: fromUser.uid,
    fromUserName: fromUser.name,
    fromUserEmail: fromUser.email,
    toUserId: toUser.uid,
    toUserName: toUser.name,
    toUserEmail: toUser.email,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createNotification({
    recipientId: toUser.uid,
    type: "connection_request",
    title: "New connection request",
    message: `${fromUser.name} sent you a connection request.`,
    data: { requestId: requestRef.id, fromUserId: fromUser.uid },
  });

  return requestRef.id;
};

export const subscribeIncomingConnectionRequests = (uid, callback) => {
  ensureReady();
  const q = query(
    collection(db, COLLECTIONS.connectionRequests),
    where("toUserId", "==", uid),
  );
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const subscribeOutgoingConnectionRequests = (uid, callback) => {
  ensureReady();
  const q = query(
    collection(db, COLLECTIONS.connectionRequests),
    where("fromUserId", "==", uid),
  );
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const respondToConnectionRequest = async (requestId, action) => {
  ensureReady();
  const requestRef = doc(db, COLLECTIONS.connectionRequests, requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error("Request not found.");
  const requestData = requestSnap.data();

  await updateDoc(requestRef, {
    status: action,
    updatedAt: serverTimestamp(),
  });

  if (action === "accepted") {
    const connectionId = [requestData.fromUserId, requestData.toUserId].sort().join("_");
    await setDoc(
      doc(db, COLLECTIONS.connections, connectionId),
      {
        participants: [requestData.fromUserId, requestData.toUserId],
        participantDetails: {
          [requestData.fromUserId]: {
            uid: requestData.fromUserId,
            name: requestData.fromUserName,
            email: requestData.fromUserEmail,
          },
          [requestData.toUserId]: {
            uid: requestData.toUserId,
            name: requestData.toUserName,
            email: requestData.toUserEmail,
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  await createNotification({
    recipientId: requestData.fromUserId,
    type: "connection_request",
    title: action === "accepted" ? "Connection request accepted" : "Connection request rejected",
    message:
      action === "accepted"
        ? `${requestData.toUserName} accepted your connection request.`
        : `${requestData.toUserName} rejected your connection request.`,
    data: { requestId, toUserId: requestData.toUserId },
  });
};

export const subscribeConnections = (uid, callback) => {
  ensureReady();
  const q = query(collection(db, COLLECTIONS.connections), where("participants", "array-contains", uid));
  return subscribeCollection(q, callback);
};

export const getMutualConnectionCount = (connections, currentUserId, targetUserId) => {
  const currentSet = new Set(
    connections
      .filter((connection) => connection.participants?.includes(currentUserId))
      .map((connection) => connection.participants.find((participant) => participant !== currentUserId))
      .filter(Boolean)
  );

  const targetSet = new Set(
    connections
      .filter((connection) => connection.participants?.includes(targetUserId))
      .map((connection) => connection.participants.find((participant) => participant !== targetUserId))
      .filter(Boolean)
  );

  let mutual = 0;
  currentSet.forEach((id) => {
    if (targetSet.has(id)) mutual += 1;
  });
  return mutual;
};

export const getChatId = (uidA, uidB) => [uidA, uidB].sort().join("_");

export const createOrGetChat = async (userA, userB) => {
  ensureReady();
  const chatId = getChatId(userA.uid, userB.uid);
  await setDoc(
    doc(db, COLLECTIONS.chats, chatId),
    {
      participants: [userA.uid, userB.uid],
      participantProfiles: {
        [userA.uid]: { uid: userA.uid, name: userA.name, email: userA.email },
        [userB.uid]: { uid: userB.uid, name: userB.name, email: userB.email },
      },
      lastMessage: "",
      lastMessageAt: null,
      lastMessageSenderId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return chatId;
};

export const subscribeChats = (uid, callback) => {
  ensureReady();
  const q = query(collection(db, COLLECTIONS.chats), where("participants", "array-contains", uid));
  return subscribeCollection(q, callback);
};

export const subscribeMessages = (chatId, callback) => {
  ensureReady();
  const q = query(collection(db, COLLECTIONS.chats, chatId, "messages"), orderBy("createdAt", "asc"));
  return subscribeCollection(q, callback);
};

export const sendChatMessage = async ({ chatId, sender, text }) => {
  ensureReady();
  const trimmed = text.trim();
  if (!trimmed) return;
  const chatRef = doc(db, COLLECTIONS.chats, chatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) throw new Error("Chat not found.");
  const chatData = chatSnap.data();

  await addDoc(collection(db, COLLECTIONS.chats, chatId, "messages"), {
    chatId,
    senderId: sender.uid,
    senderName: sender.name,
    text: trimmed,
    readBy: [sender.uid],
    createdAt: serverTimestamp(),
  });

  await updateDoc(chatRef, {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: sender.uid,
    updatedAt: serverTimestamp(),
  });

  const recipients = (chatData.participants || []).filter((participantId) => participantId !== sender.uid);
  await Promise.all(
    recipients.map((recipientId) =>
      createNotification({
        recipientId,
        type: "message",
        title: `New message from ${sender.name}`,
        message: trimmed,
        data: { chatId },
      })
    )
  );
};

export const createProject = async (project, creator) => {
  ensureReady();
  const docRef = await addDoc(collection(db, COLLECTIONS.projects), {
    title: project.title?.trim(),
    description: project.description?.trim(),
    status: project.status || "Open",
    members: project.members || [],
    skills: project.skills || [],
    createdById: creator.uid,
    createdByName: creator.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logUserActivity({
    userId: creator.uid,
    userName: creator.name,
    userRole: creator.role || "student",
    action: "project_created",
    details: project.title,
  });
  return docRef.id;
};

export const subscribeProjects = (callback) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.projects);
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const updateProject = async (projectId, updates, adminUser) => {
  ensureReady();
  await updateDoc(doc(db, COLLECTIONS.projects, projectId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  if (adminUser) {
    await logUserActivity({
      userId: adminUser.uid,
      userName: adminUser.name,
      userRole: "admin",
      action: "project_updated",
      details: updates.title || projectId,
    });
  }
};

export const deleteProject = async (projectId, adminUser) => {
  ensureReady();
  await deleteDoc(doc(db, COLLECTIONS.projects, projectId));
  if (adminUser) {
    await logUserActivity({
      userId: adminUser.uid,
      userName: adminUser.name,
      userRole: "admin",
      action: "project_deleted",
      details: projectId,
    });
  }
};

export const joinProject = async (projectId, user) => {
  ensureReady();
  const projectRef = doc(db, COLLECTIONS.projects, projectId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(projectRef);
    if (!snap.exists()) throw new Error("Project not found.");
    const data = snap.data();
    const members = data.members || [];
    const alreadyJoined = members.some((member) => member.uid === user.uid);
    if (alreadyJoined) return;
    transaction.update(projectRef, {
      members: [...members, { uid: user.uid, name: user.name, email: user.email }],
      updatedAt: serverTimestamp(),
    });
  });
};

export const getAdminDashboardStats = async () => {
  ensureReady();
  try {
    const [students, opportunities, applications, projects] = await Promise.all([
      getCountFromServer(query(collection(db, COLLECTIONS.users), where("role", "==", "student"))),
      getCountFromServer(collection(db, COLLECTIONS.opportunities)),
      getCountFromServer(collection(db, COLLECTIONS.applications)),
      getCountFromServer(collection(db, COLLECTIONS.projects)),
    ]);
    return {
      totalStudents: students.data().count,
      totalPosts: opportunities.data().count,
      applicationsReceived: applications.data().count,
      activeProjects: projects.data().count,
    };
  } catch (error) {
    console.error("[TalentMesh] Admin stats error:", error);
    return {
      totalStudents: 0,
      totalPosts: 0,
      applicationsReceived: 0,
      activeProjects: 0,
    };
  }
};

export const getStudentDashboardStats = async (uid) => {
  ensureReady();
  try {
    const [connections, applications, notifications, projectsSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.connections), where("participants", "array-contains", uid))),
      getDocs(query(collection(db, COLLECTIONS.applications), where("studentId", "==", uid))),
      getDocs(query(collection(db, COLLECTIONS.notifications), where("recipientId", "==", uid))),
      getDocs(collection(db, COLLECTIONS.projects)),
    ]);

    const joinedProjects = projectsSnap.docs.filter((projectDoc) =>
      (projectDoc.data().members || []).some((member) => member.uid === uid),
    ).length;

    const unreadNotifications = notifications.docs.filter(
      (notificationDoc) => !notificationDoc.data().read,
    ).length;

    return {
      connections: connections.size,
      applications: applications.size,
      projects: joinedProjects,
      notifications: unreadNotifications,
    };
  } catch (error) {
    console.error("[TalentMesh] Student stats error:", error);
    return {
      connections: 0,
      applications: 0,
      projects: 0,
      notifications: 0,
    };
  }
};

export const logUserActivity = async ({ userId, userName, userRole, action, details = "" }) => {
  ensureReady();
  if (!userId || !action) return;
  await addDoc(collection(db, COLLECTIONS.userActivity), {
    userId,
    userName: userName || "Unknown",
    userRole: userRole || "student",
    action,
    details,
    createdAt: serverTimestamp(),
  });
};

export const subscribeUserActivity = (callback, limitCount = 50) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.userActivity);
  return subscribeCollection(q, (items) =>
    callback(sortByCreatedAtDesc(items).slice(0, limitCount)),
  );
};

export const subscribeSkills = (callback) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.skills);
  return subscribeCollection(q, (items) => callback(sortByNameAsc(items)));
};

export const createSkill = async (skill, adminUser) => {
  ensureReady();
  const name = skill.name?.trim();
  if (!name) throw new Error("Skill name is required.");
  const existing = await getDocs(
    query(collection(db, COLLECTIONS.skills), where("name", "==", name), limit(1)),
  );
  if (!existing.empty) throw new Error("This skill already exists.");
  const docRef = await addDoc(collection(db, COLLECTIONS.skills), {
    name,
    category: skill.category?.trim() || "General",
    description: skill.description?.trim() || "",
    createdById: adminUser.uid,
    createdByName: adminUser.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logUserActivity({
    userId: adminUser.uid,
    userName: adminUser.name,
    userRole: "admin",
    action: "skill_created",
    details: name,
  });
  return docRef.id;
};

export const deleteSkill = async (skillId, adminUser) => {
  ensureReady();
  await deleteDoc(doc(db, COLLECTIONS.skills, skillId));
  await logUserActivity({
    userId: adminUser.uid,
    userName: adminUser.name,
    userRole: "admin",
    action: "skill_deleted",
    details: skillId,
  });
};

export const subscribeLearningResources = (callback) => {
  ensureReady();
  const q = collection(db, COLLECTIONS.learningResources);
  return subscribeCollection(q, (items) => callback(sortByCreatedAtDesc(items)));
};

export const createLearningResource = async (resource, adminUser) => {
  ensureReady();
  const docRef = await addDoc(collection(db, COLLECTIONS.learningResources), {
    title: resource.title?.trim(),
    description: resource.description?.trim() || "",
    url: resource.url?.trim() || "",
    type: resource.type || "article",
    category: resource.category?.trim() || "General",
    createdById: adminUser.uid,
    createdByName: adminUser.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await logUserActivity({
    userId: adminUser.uid,
    userName: adminUser.name,
    userRole: "admin",
    action: "resource_created",
    details: resource.title,
  });
  return docRef.id;
};

export const deleteLearningResource = async (resourceId, adminUser) => {
  ensureReady();
  await deleteDoc(doc(db, COLLECTIONS.learningResources, resourceId));
  await logUserActivity({
    userId: adminUser.uid,
    userName: adminUser.name,
    userRole: "admin",
    action: "resource_deleted",
    details: resourceId,
  });
};

export const getPlatformAnalytics = async () => {
  ensureReady();
  const empty = {
    totalStudents: 0,
    totalAdmins: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    totalProjects: 0,
    totalConnections: 0,
    totalAnnouncements: 0,
    totalResources: 0,
    totalSkills: 0,
    applicationsByStatus: { Pending: 0, Accepted: 0, Rejected: 0 },
    opportunitiesByType: {},
    recentActivityCount: 0,
  };

  try {
  const [
    students,
    admins,
    opportunities,
    applications,
    projects,
    connections,
    announcements,
    resources,
    skills,
    activitySnap,
  ] = await Promise.all([
    getCountFromServer(query(collection(db, COLLECTIONS.users), where("role", "==", "student"))),
    getCountFromServer(query(collection(db, COLLECTIONS.users), where("role", "==", "admin"))),
    getCountFromServer(collection(db, COLLECTIONS.opportunities)),
    getCountFromServer(collection(db, COLLECTIONS.applications)),
    getCountFromServer(collection(db, COLLECTIONS.projects)),
    getCountFromServer(collection(db, COLLECTIONS.connections)),
    getCountFromServer(collection(db, COLLECTIONS.announcements)),
    getCountFromServer(collection(db, COLLECTIONS.learningResources)),
    getCountFromServer(collection(db, COLLECTIONS.skills)),
    getDocs(collection(db, COLLECTIONS.userActivity)),
  ]);

  const applicationsByStatus = { Pending: 0, Accepted: 0, Rejected: 0 };
  const appsSnap = await getDocs(collection(db, COLLECTIONS.applications));
  appsSnap.docs.forEach((docSnap) => {
    const status = docSnap.data().status || "Pending";
    applicationsByStatus[status] = (applicationsByStatus[status] || 0) + 1;
  });

  const opportunitiesByType = {};
  const oppsSnap = await getDocs(collection(db, COLLECTIONS.opportunities));
  oppsSnap.docs.forEach((docSnap) => {
    const type = docSnap.data().type || "Other";
    opportunitiesByType[type] = (opportunitiesByType[type] || 0) + 1;
  });

  return {
    totalStudents: students.data().count,
    totalAdmins: admins.data().count,
    totalOpportunities: opportunities.data().count,
    totalApplications: applications.data().count,
    totalProjects: projects.data().count,
    totalConnections: connections.data().count,
    totalAnnouncements: announcements.data().count,
    totalResources: resources.data().count,
    totalSkills: skills.data().count,
    applicationsByStatus,
    opportunitiesByType,
    recentActivityCount: activitySnap.size,
  };
  } catch (error) {
    console.error("[TalentMesh] Analytics error:", error);
    return empty;
  }
};
