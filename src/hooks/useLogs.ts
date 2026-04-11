"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
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

        // 실시간 근태 및 목표 지속성을 위해 프로필 문서 업데이트
        if (data.work_status !== undefined || data.call_target !== undefined) {
            const profileUpdate: any = {};
            if (data.work_status !== undefined) profileUpdate.current_status = data.work_status;
            if (data.call_target !== undefined) profileUpdate.current_call_target = data.call_target;

            await setDoc(doc(db, "members", user.uid), profileUpdate, { merge: true });
        }

        setLoading(false);
    };

    /**
     * Firebase 복합 인덱스 에러를 방지하기 위해 orderBy를 제거하고 
     * 클라이언트 사이드에서 메모리 정렬을 수행합니다.
     */
    const getRecentLogs = async (days = 7) => {
        if (!user) return [];
        const q = query(
            collection(db, "daily_logs"),
            where("uid", "==", user.uid)
            // orderBy("date", "desc") 제거: 복합 인덱스 요구 방지
        );
        const querySnapshot = await getDocs(q);
        const logs = querySnapshot.docs.map(doc => doc.data() as DailyLog);

        // 클라이언트 사이드 정렬 및 제한
        return logs
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, days);
    };

    const getMonthlyLogs = async (targetUid?: string) => {
        const uid = targetUid || user?.uid;
        if (!uid) return [];

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        const q = query(
            collection(db, "daily_logs"),
            where("uid", "==", uid)
            // orderBy("date", "desc") 제거: 복합 인덱스 요구 방지
        );

        const querySnapshot = await getDocs(q);
        const logs: DailyLog[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data() as DailyLog;
            if (data.date >= firstDayOfMonth) {
                logs.push(data);
            }
        });

        // 클라이언트 사이드 정렬
        return logs.sort((a, b) => b.date.localeCompare(a.date));
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
            if (data.date >= firstDayOfMonth && data.date <= today) {
                totalCalls += (data.call_actual || 0);
            }
        });

        return { totalCalls };
    };

    return { getTodayLog, saveLog, getRecentLogs, getMonthlyLogs, getMonthlyStats, loading };
}
