import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtmJxv6b2tzDh-whb1hAlrFtM4ErZ7oRs",
  authDomain: "fixmate-aa921.firebaseapp.com",
  projectId: "fixmate-aa921",
  storageBucket: "fixmate-aa921.firebasestorage.app",
  messagingSenderId: "218097056756",
  appId: "1:218097056756:web:752dbf6f5e87bd755217a1",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence based on platform
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { Platform } from "react-native";

// @ts-ignore: getReactNativePersistence is available in native builds but missing from web types
import { getReactNativePersistence } from "firebase/auth";

let auth: Auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics conditionally
let analytics: any;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((err) => {
    console.log("Analytics not supported", err);
  });

export { analytics, app, auth, db };
