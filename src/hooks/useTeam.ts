"use client";

import { useState, useCallback } from "react";
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
import { Connection } from "@/lib/types";

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

        // 2. Create a connection request with a predictable ID for security rules
        const connId = `${leaderEmail}_${user.uid}`;
        await setDoc(doc(db, "connections", connId), {
            leaderEmail,
            memberUid: user.uid,
            memberEmail: profile.email,
            memberName: profile.email?.split('@')[0],
            status: 'pending',
            createdAt: new Date().toISOString(),
        });

        // 3. Add to local leaders list (for UI showing 'pending')
        await updateDoc(doc(db, "members", user.uid), {
            leaders: arrayUnion(leaderEmail)
        });

        setLoading(false);
    };

    const removeLeader = async (leaderEmail: string) => {
        if (!user) return;
        await updateDoc(doc(db, "members", user.uid), {
            leaders: arrayRemove(leaderEmail)
        });
        // Also remove from connections
        const q = query(
            collection(db, "connections"),
            where("memberUid", "==", user.uid),
            where("leaderEmail", "==", leaderEmail)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
            await updateDoc(d.ref, { status: 'removed' }); // or delete
        });
    };

    const fetchMyConnections = useCallback((callback: (conns: Connection[]) => void) => {
        if (!user) return () => { };

        const q = query(
            collection(db, "connections"),
            where("memberUid", "==", user.uid)
            // status 필터를 제거하여 복합 인덱스 요구사항 우회
        );

        return onSnapshot(q, (snapshot) => {
            const list = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as Connection))
                .filter(c => c.status !== 'removed'); // 클라이언트 사이드 필터링
            callback(list);
        });
    }, [user]);

    return { requestLeader, removeLeader, fetchMyConnections, loading };
}
