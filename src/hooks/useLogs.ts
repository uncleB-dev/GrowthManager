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

    const saveLog = async (data: Partial<DailyLog>, targetDate?: string) => {
        if (!user) return;
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const dateStr = targetDate || today;
        const logId = `${user.uid}_${dateStr}`;

        const logData = {
            ...data,
            uid: user.uid,
            date: dateStr,
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

    const getMonthlyLogs = async () => {
        if (!user) return [];
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const q = query(
            collection(db, "daily_logs"),
            where("uid", "==", user.uid),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        const logs: DailyLog[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data() as DailyLog;
            if (data.date >= firstDayOfMonth) {
                logs.push(data);
            }
        });
        return logs;
    };

    const getMonthlyStats = async () => {
        if (!user) return { totalCalls: 0 };
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];

        const q = query(
            collection(db, "daily_logs"),
            where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        let totalCalls = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data() as DailyLog;
            // 이번 달 1일부터 오늘까지의 데이터 합산 (사용자 요청에 따라 오늘 실적도 포함하는 것이 자연스러울 수 있음)
            // 사용자 요청: "[목표 콜 수 / 시행 콜 수]" 형식에서 시행 콜 수에 오늘 것도 포함되어야 함.
            if (data.date >= firstDayOfMonth && data.date <= today) {
                totalCalls += (data.call_actual || 0);
            }
        });

        return { totalCalls };
    };

    return { getTodayLog, saveLog, getRecentLogs, getMonthlyLogs, getMonthlyStats, loading };
}
