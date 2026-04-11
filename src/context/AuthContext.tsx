"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { db } from '@/lib/firebase';
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
    const supabase = createClient();

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    useEffect(() => {
        // Check active sessions and subscribe to auth changes
        const setData = async (sessionUser: User | null) => {
            setUser(sessionUser);

            if (sessionUser) {
                // Sync with Firestore members table
                const userDocRef = doc(db, 'members', sessionUser.id);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    const newProfile: UserProfile = {
                        uid: sessionUser.id,
                        email: sessionUser.email || null,
                        leaders: [],
                        monthly_goal_amount: 0,
                        monthly_goal_cases: 0,
                        createdAt: new Date().toISOString(),
                    };
                    await setDoc(userDocRef, newProfile);
                    setProfile(newProfile);
                } else {
                    setProfile(userDoc.data() as UserProfile);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setData(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    return (
        <AuthContext.Provider value={{ user, loading, profile, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
