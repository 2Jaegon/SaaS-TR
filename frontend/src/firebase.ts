// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD32t5nh6zx4oayzwQoiAVHh-jywIaZ4pc",
    authDomain: "gong-46b6f.firebaseapp.com",
    projectId: "gong-46b6f",
    storageBucket: "gong-46b6f.firebasestorage.app",
    messagingSenderId: "309443317753",
    appId: "1:309443317753:web:92e73998846dc819493728",
    // measurementId: "G-D7JDEVE69G"
  };

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 로그인 함수
export const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // 회원가입 함수
  export const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // 로그아웃 함수
  export const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };
  
  // 사용자 상태 감지
  export const observeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  };

export { auth };