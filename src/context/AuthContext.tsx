"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { UserProfile } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    profile: UserProfile | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    profile: null,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const syncProfile = async (firebaseUser: User) => {
        try {
            const docRef = doc(db, 'members', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "";

            if (docSnap.exists()) {
                const existingData = docSnap.data() as UserProfile;
                // 이름 정보가 없거나 구글 이름과 다를 경우 업데이트
                if (!existingData.name || (firebaseUser.displayName && existingData.name !== firebaseUser.displayName)) {
                    await setDoc(docRef, { name: displayName }, { merge: true });
                    setProfile({ ...existingData, name: displayName });
                } else {
                    setProfile(existingData);
                }
            } else {
                const newProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    name: displayName,
                    role: 'agent',
                    leaders: [],
                    monthly_goal_amount: 0,
                    monthly_goal_cases: 0,
                    createdAt: new Date().toISOString()
                };
                await setDoc(docRef, newProfile);
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Profile sync error:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await syncProfile(firebaseUser);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, profile, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
