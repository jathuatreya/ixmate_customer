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
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db, auth as firebaseAuth } from "./utils/firebaseConfig"; // Rename import to avoid conflict
import AsyncStorage from "@react-native-async-storage/async-storage";
const auth = firebaseAuth as Auth; // Assert type if needed or just use it
const USER_CACHE_KEY = "fixmate_user_session";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  token?: string; // Not needed for Firebase but keeping for type compatibility if used elsewhere
};

type AuthContextType = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phoneNumber: string,
    address: string,
    city: string,
    district: string,
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
    // 1. Load cached session once on mount
    const loadCachedSession = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem(USER_CACHE_KEY);
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      } catch (error) {
        console.error("Failed to load cached session", error);
      }
    };
    loadCachedSession();

    // 2. Setup Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // SECURITY CHECK: Only allow customers
            if (userData.role !== "customer") {
              await firebaseSignOut(auth);
              setUser(null);
              await AsyncStorage.removeItem(USER_CACHE_KEY);
              setIsLoading(false);
              return;
            }

            const mappedUser: User = {
              _id: firebaseUser.uid,
              name: userData.displayName || firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              role: userData.role,
              phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber || undefined,
              address: userData.address || undefined,
              city: userData.city || undefined,
              district: userData.district || undefined,
            };
            setUser(mappedUser);
            // Persist to cache
            await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mappedUser));
          } else {
            // No profile found, force logout
            console.warn("No profile found for uid:", firebaseUser.uid);
            await firebaseSignOut(auth);
            setUser(null);
            await AsyncStorage.removeItem(USER_CACHE_KEY);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(null);
          // Don't remove cache on fetch error (might be transient network issue)
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem(USER_CACHE_KEY);
      }
      setIsLoading(false);
    });

    // 3. Safety timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // Only run on mount

  useProtectedRoute(user, isLoading);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Immediate role verification
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== "customer") {
          await firebaseSignOut(auth);
          throw new Error("Access Denied: You do not have permission to access the customer app.");
        }
      } else {
        await firebaseSignOut(auth);
        throw new Error("No user profile found. Please register as a customer.");
      }
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
    address: string,
    city: string,
    district: string,
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
          address: address,
          city: city,
          district: district,
          role: "customer", // Enforce role
          createdAt: new Date(),
        });

        // Sign out immediately so the user has to login manually
        await firebaseSignOut(auth);
        setUser(null);
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
