import { useState, useEffect } from "react";
import { auth, onAuthChange, type User as FirebaseUser } from "@/lib/firebase";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  const displayNameParts = user.displayName?.split(" ") || [];
  return {
    id: user.uid,
    email: user.email,
    firstName: displayNameParts[0] || null,
    lastName: displayNameParts.slice(1).join(" ") || null,
    profileImageUrl: user.photoURL,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
