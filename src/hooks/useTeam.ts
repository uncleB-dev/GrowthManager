"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    addDoc,
    onSnapshot
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export function useTeam() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Add a leader (sends a connection request)
    const requestLeader = async (leaderEmail: string) => {
        if (!user || !profile) return;
        setLoading(true);

        // 1. Check if the leader exists in members table
        const q = query(collection(db, "members"), where("email", "==", leaderEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("해당 이메일의 팀장을 찾을 수 없습니다.");
            setLoading(false);
            return;
        }

        const leaderData = querySnapshot.docs[0].data();

        // 2. Create a connection request
        await addDoc(collection(db, "connections"), {
            leaderEmail,
            memberUid: user.id,
            memberEmail: profile.email,
            memberName: profile.email?.split('@')[0], // Simplified name
            status: 'pending',
            createdAt: new Date().toISOString(),
        });

        // 3. Add to local leaders list (for UI showing 'pending')
        await updateDoc(doc(db, "members", user.id), {
            leaders: arrayUnion(leaderEmail)
        });

        setLoading(false);
    };

    const removeLeader = async (leaderEmail: string) => {
        if (!user) return;
        await updateDoc(doc(db, "members", user.id), {
            leaders: arrayRemove(leaderEmail)
        });
        // Also remove from connections
        const q = query(
            collection(db, "connections"),
            where("memberUid", "==", user.id),
            where("leaderEmail", "==", leaderEmail)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
            await updateDoc(d.ref, { status: 'removed' }); // or delete
        });
    };

    return { requestLeader, removeLeader, loading };
}
