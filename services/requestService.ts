import { auth, db } from "@/utils/firebaseConfig"; // Adjust import path if needed
// import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type RequestData = {
  serviceType: string;
  description: string;
  urgency: string; // 'low' | 'normal' | 'high'
  photos: string[]; // URLs or base64 (mock for now)
  location: {
    address: string;
    date: string;
    time: string;
    isFlexible: boolean;
    accessNotes: string;
  };
  status: string; // 'pending', 'accepted', etc.
};

export const submitRequest = async (requestData: RequestData) => {
  try {
    // const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User must be logged in to submit a request");
    }

    const docRef = await addDoc(collection(db, "requests"), {
      ...requestData,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      status: "pending", // Default status
    });

    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};
