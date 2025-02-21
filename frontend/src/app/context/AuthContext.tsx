"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { auth, db } from "@/firebase"; // Firestore 추가
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // Firestore 실시간 감지

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isSubscribed: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    // ✅ Firebase 인증 상태 변경 감지
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        // ✅ Firestore 실시간 감지 (onSnapshot)
        const unsubscribeSub = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setIsSubscribed(doc.data().isSubscribed || false);
          } else {
            setIsSubscribed(false);
          }
        });

        return () => unsubscribeSub(); // 클린업
      } else {
        setIsSubscribed(false);
      }
    });

    return () => unsubscribeAuth(); // 클린업
  }, []);

  return <AuthContext.Provider value={{ user, isSubscribed }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
