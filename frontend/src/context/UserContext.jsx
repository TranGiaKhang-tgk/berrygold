import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Tạo Context
const UserContext = createContext();

// Provider
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "Users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const mergedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...data,
          };
          setUser(mergedUser);
          localStorage.setItem("BERRYGOLDUser", JSON.stringify(mergedUser));
        } else {
          const basicUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          };
          setUser(basicUser);
          localStorage.setItem("BERRYGOLDUser", JSON.stringify(basicUser));
        }
      } else {
        setUser(null);
        localStorage.removeItem("BERRYGOLDUser");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("berrygoldUser");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook tiện dụng
export function useUser() {
  return useContext(UserContext);
}
