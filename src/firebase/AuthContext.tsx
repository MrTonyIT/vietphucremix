import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from './config';
import { LookbookEntry } from '../utils/lookbookStorage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  cloudSyncEnabled: boolean;
  cloudLookbooks: LookbookEntry[];
  saveLookbookToCloud: (entry: LookbookEntry) => Promise<boolean>;
  deleteLookbookFromCloud: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  cloudSyncEnabled: false,
  cloudLookbooks: [],
  saveLookbookToCloud: async () => false,
  deleteLookbookFromCloud: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudLookbooks, setCloudLookbooks] = useState<LookbookEntry[]>([]);

  // Test connection on boot per Firebase guidelines
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Persist/Update user profile in Firestore
        const userPath = `users/${currentUser.uid}`;
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userDocRef,
            {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Người dùng Việt Phục',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, userPath);
        }
      } else {
        setCloudLookbooks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to User's Cloud Lookbooks with onSnapshot (Only when authenticated)
  useEffect(() => {
    if (!user) {
      setCloudLookbooks([]);
      return;
    }

    const lookbooksColPath = `users/${user.uid}/lookbooks`;
    const colRef = collection(db, 'users', user.uid, 'lookbooks');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const entries: LookbookEntry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data && data.id && data.name && data.entitySlug && Array.isArray(data.itemIds)) {
            entries.push({
              id: data.id,
              name: data.name,
              entitySlug: data.entitySlug,
              itemIds: data.itemIds,
              savedAt: data.savedAt || 'Mới cập nhật',
              recipeId: data.recipeId,
              sceneId: data.sceneId,
              sceneName: data.sceneName,
              colorHarmony: data.colorHarmony,
            });
          }
        });
        setCloudLookbooks(entries);
      },
      (error) => {
        // Strict mandatory error handling per Firebase Skill instructions
        handleFirestoreError(error, OperationType.LIST, lookbooksColPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('[Auth] Google Sign-in error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }
  }, []);

  const saveLookbookToCloud = useCallback(
    async (entry: LookbookEntry): Promise<boolean> => {
      if (!user) return false;

      const path = `users/${user.uid}/lookbooks/${entry.id}`;
      try {
        const docRef = doc(db, 'users', user.uid, 'lookbooks', entry.id);
        const payload: Record<string, any> = {
          id: entry.id,
          userId: user.uid,
          name: entry.name,
          entitySlug: entry.entitySlug,
          itemIds: entry.itemIds,
          savedAt: typeof entry.savedAt === 'string' ? entry.savedAt : new Date().toISOString(),
        };
        if (entry.recipeId) payload.recipeId = entry.recipeId;
        if (entry.sceneId) payload.sceneId = entry.sceneId;
        if (entry.sceneName) payload.sceneName = entry.sceneName;
        if (entry.colorHarmony) payload.colorHarmony = entry.colorHarmony;

        await setDoc(docRef, payload);
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
        return false;
      }
    },
    [user]
  );

  const deleteLookbookFromCloud = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      const path = `users/${user.uid}/lookbooks/${id}`;
      try {
        const docRef = doc(db, 'users', user.uid, 'lookbooks', id);
        await deleteDoc(docRef);
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
        return false;
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        cloudSyncEnabled: !!user,
        cloudLookbooks,
        saveLookbookToCloud,
        deleteLookbookFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
