"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Check, X, User, ArrowRight, BarChart3, Phone, MessageSquare } from "lucide-react";
import { Connection, DailyLog } from "@/lib/types";

export function LeaderDashboard() {
    const { user } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [teamLogs, setTeamLogs] = useState<Record<string, DailyLog>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;

        const q = query(
            collection(db, "connections"),
            where("leaderEmail", "==", user.email)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allConns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection));
            const connList = allConns.filter(c => c.status === "pending" || c.status === "accepted");

            setConnections(connList);
            setLoading(false);

            const acceptedMembers = connList.filter(c => c.status === 'accepted').map(c => c.memberUid);
            if (acceptedMembers.length > 0) {
                // 복합 인덱스 에러를 방지하고 10명 이상의 팀원도 처리할 수 있도록 개별 getDoc 호출로 변경합니다.
                const today = new Date().toISOString().split('T')[0];
                const logPromises = acceptedMembers.map(async (memberUid) => {
                    const logId = `${memberUid}_${today}`;
                    const d = await getDoc(doc(db, "daily_logs", logId));
                    return d.exists() ? (d.data() as DailyLog) : null;
                });

                Promise.all(logPromises).then(results => {
                    const logs: Record<string, DailyLog> = {};
                    results.forEach(log => {
                        if (log) logs[log.uid] = log;
                    });
                    setTeamLogs(logs);
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleStatusChange = async (connId: string, newStatus: string) => {
        await updateDoc(doc(db, "connections", connId), { status: newStatus });
    };

    if (loading) return <div className="p-12 text-center text-[var(--muted-sand)] font-medium">데이터를 불러오는 중입니다...</div>;

    const pendingRequests = connections.filter(c => c.status === 'pending');
    const teamMembers = connections.filter(c => c.status === 'accepted');

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 pb-20">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-outfit text-[var(--off-black)] tracking-tight">팀 모니터링</h1>
                    <p className="text-[var(--muted-sand)] text-lg font-medium">우리 팀원들의 활동 현황을 따뜻한 시선으로 확인하세요.</p>
                </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-6 bg-orange-400" />
                        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.2em] font-outfit">승인 대기 중</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="premium-card p-6 flex items-center justify-between border-orange-200 bg-orange-50/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-[var(--off-black)]">{req.memberName}</p>
                                        <p className="text-xs text-[var(--muted-sand)]">{req.memberEmail}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange(req.id, 'accepted')}
                                        className="p-3 bg-white text-green-600 rounded-[8px] border border-[var(--oat-border)] hover:bg-green-50 transition-all shadow-sm"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(req.id, 'rejected')}
                                        className="p-3 bg-white text-red-600 rounded-[8px] border border-[var(--oat-border)] hover:bg-red-50 transition-all shadow-sm"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-6 bg-[var(--off-black)]" />
                    <h2 className="text-sm font-bold text-[var(--off-black)] uppercase tracking-[0.2em] font-outfit">나의 소중한 팀원 ({teamMembers.length})</h2>
                </div>
                <div className="space-y-6">
                    {teamMembers.length > 0 ? teamMembers.map(member => {
                        const log = teamLogs[member.memberUid];
                        return (
                            <div key={member.id} className="premium-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:translate-x-1 transition-all group border-l-[6px] border-l-[var(--oat-border)] hover:border-l-[var(--fin-orange)]">
                                <div className="flex items-center gap-5 min-w-[250px]">
                                    <div className="w-14 h-14 rounded-[16px] bg-[var(--canvas)] flex items-center justify-center text-[var(--off-black)] shadow-inner">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-bold text-[var(--off-black)]">{member.memberName}</p>
                                        <p className="text-xs text-[var(--muted-sand)] font-medium">{member.memberEmail}</p>
                                        <div className="pt-2">
                                            {log ? (
                                                <span className="px-3 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full border border-green-100 uppercase tracking-wider">
                                                    {log.work_status}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-[var(--canvas)] text-[var(--muted-sand)] text-[11px] font-bold rounded-full border border-[var(--oat-border)] uppercase tracking-wider">
                                                    미입력
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-10 flex-1 items-center justify-end">
                                    <div className="space-y-2">
                                        <p className="text-[11px] text-[var(--muted-sand)] uppercase font-bold tracking-widest flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" /> 연결 / 목표
                                        </p>
                                        <p className="text-lg font-bold text-[var(--off-black)] font-outfit">
                                            {log?.call_actual || 0} / <span className="text-[var(--muted-sand)] text-sm font-medium">{log?.call_target || '-'}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[11px] text-[var(--muted-sand)] uppercase font-bold tracking-widest flex items-center gap-2">
                                            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> 시도 콜
                                        </p>
                                        <p className="text-lg font-bold text-indigo-600 font-outfit">
                                            {log?.call_attempts || 0}
                                        </p>
                                    </div>
                                    <div className="hidden lg:block space-y-2 max-w-[220px]">
                                        <p className="text-[11px] text-[var(--muted-sand)] uppercase font-bold tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" /> 메모
                                        </p>
                                        <p className="text-xs text-[var(--off-black)] font-medium italic leading-relaxed line-clamp-2">
                                            {log?.memo || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-[var(--canvas)] transition-all">
                                        <ArrowRight className="w-5 h-5 text-[var(--oat-border)] group-hover:text-[var(--fin-orange)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="premium-card p-20 text-center space-y-4 border-dashed bg-[var(--canvas)]/50">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-[var(--oat-border)] shadow-sm">
                                <User className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-[var(--off-black)]">관리 중인 팀원이 없습니다.</p>
                                <p className="text-[var(--muted-sand)] font-medium">설계사 계정에서 팀장님의 이메일을 등록해달라고 요청하세요.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
