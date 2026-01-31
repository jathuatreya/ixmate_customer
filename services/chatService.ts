import { auth, db } from "@/utils/firebaseConfig";
// import { getAuth } from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

export type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  createdAt: any;
  image?: string;
  audio?: boolean;
  read: boolean;
  type?: "text" | "image" | "audio" | "system";
};

export type Conversation = {
  id: string;
  participants: string[]; // [userId, workerId]
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  participantDetails: {
    [key: string]: {
      name: string;
      avatar?: string;
      role?: string;
    };
  };
};

// --- Conversations ---

export const listenToConversations = (
  callback: (conversations: Conversation[]) => void,
) => {
  // const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", user.uid),
    orderBy("lastMessageTime", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Conversation,
    );
    callback(conversations);
  });
};

export const createConversation = async (
  participantId: string,
  participantName: string,
  role: string = "Worker",
) => {
  // const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  // Check if conversation exists (simplified for now, ideally strictly query for both IDs)
  // For MVP, we just create a new one or you'd query for existing doc with these 2 participants.

  const newConv = {
    participants: [user.uid, participantId],
    lastMessage: "",
    lastMessageTime: serverTimestamp(),
    unreadCount: 0,
    participantDetails: {
      [user.uid]: {
        name: user.displayName || "User",
        avatar: user.photoURL || null,
        role: "Client",
      },
      [participantId]: {
        name: participantName,
        avatar: null, // Placeholder or fetch
        role: role,
      },
    },
  };

  const docRef = await addDoc(collection(db, "conversations"), newConv);
  return docRef.id;
};

// --- Messages ---

export const listenToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
) => {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"), // or desc if you invert list
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Helper to format timestamp if needed, but keeping raw for now
      } as Message;
    });
    callback(messages);
  });
};

export const sendMessage = async (
  conversationId: string,
  text: string,
  type: "text" | "image" = "text",
  imageUrl?: string,
) => {
  // const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const messageData = {
    text,
    senderId: user.uid,
    senderName: user.displayName || "User",
    createdAt: serverTimestamp(),
    read: false,
    type,
    image: imageUrl || null,
  };

  // 1. Add message
  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    messageData,
  );

  // 2. Update conversation last message
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: type === "image" ? "Sent an image" : text,
    lastMessageTime: serverTimestamp(),
    // Increment unread count logic would go here (complex for multi-user, usually cloud function)
  });
};
