"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export function useLogs() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const getTodayLog = async () => {
        if (!user) return null;
        const today = new Date().toISOString().split('T')[0];
        const logId = `${user.id}_${today}`;
        const logDoc = await getDoc(doc(db, "daily_logs", logId));
        return logDoc.exists() ? logDoc.data() : null;
    };

    const saveLog = async (data: any) => {
        if (!user) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const logId = `${user.id}_${today}`;

        const logData = {
            ...data,
            uid: user.id,
            date: today,
            updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, "daily_logs", logId), logData, { merge: true });
        setLoading(false);
    };

    const getRecentLogs = async (days = 7) => {
        if (!user) return [];
        const q = query(
            collection(db, "daily_logs"),
            where("uid", "==", user.id),
            orderBy("date", "desc"),
            limit(days)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    };

    return { getTodayLog, saveLog, getRecentLogs, loading };
}
