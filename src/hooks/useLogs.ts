"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { DailyLog } from "@/lib/types";

export function useLogs() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const getTodayLog = async () => {
        if (!user) return null;
        const today = new Date().toISOString().split('T')[0];
        const logId = `${user.uid}_${today}`;
        const logDoc = await getDoc(doc(db, "daily_logs", logId));
        return logDoc.exists() ? logDoc.data() as DailyLog : null;
    };

    const saveLog = async (data: Partial<DailyLog>) => {
        if (!user) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const logId = `${user.uid}_${today}`;

        const logData = {
            ...data,
            uid: user.uid,
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
            where("uid", "==", user.uid),
            orderBy("date", "desc"),
            limit(days)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as DailyLog);
    };

    const getMonthlyStats = async () => {
        if (!user) return { totalCalls: 0 };
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];

        // 복합 인덱스 에러를 방지하기 위해 uid로만 쿼리하고 클라이언트에서 필터링합니다.
        const q = query(
            collection(db, "daily_logs"),
            where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        let totalCalls = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data() as DailyLog;
            // 이번 달 1일부터 어제까지의 데이터만 합산
            if (data.date >= firstDayOfMonth && data.date < today) {
                totalCalls += (data.call_actual || 0);
            }
        });

        return { totalCalls };
    };

    return { getTodayLog, saveLog, getRecentLogs, getMonthlyStats, loading };
}
