import { useRouter, useSegments } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
  type Auth,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db, auth as firebaseAuth } from "./utils/firebaseConfig"; // Rename import to avoid conflict
const auth = firebaseAuth as Auth; // Assert type if needed or just use it

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  token?: string; // Not needed for Firebase but keeping for type compatibility if used elsewhere
};

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  user: null,
  isLoading: true,
});

export function useSession() {
  return useContext(AuthContext);
}

function useProtectedRoute(user: User | null, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady || isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, isNavigationReady, isLoading]);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map Firebase User to our App User
  const mapUser = (firebaseUser: FirebaseUser): User => {
    return {
      _id: firebaseUser.uid,
      name: firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      role: "client", // Default role
      phoneNumber: firebaseUser.phoneNumber || undefined,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapUser(firebaseUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useProtectedRoute(user, isLoading);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Sign in error", error.message);
      throw new Error(error.message || "Login failed");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Update profile with name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          displayName: name,
          phoneNumber: phoneNumber,
          role: "customer", // Enforce role
          createdAt: new Date(),
        });

        // Force update local state
        setUser(mapUser({ ...userCredential.user, displayName: name } as any));
      }
    } catch (error: any) {
      console.error("Sign up error", error.message);
      throw new Error(error.message || "Signup failed");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        signUp,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
