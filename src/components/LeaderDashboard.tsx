"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Check, X, User, ArrowRight, BarChart3, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { Connection, DailyLog } from "@/lib/types";

export function LeaderDashboard() {
    const { user } = useAuth();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [teamLogs, setTeamLogs] = useState<Record<string, DailyLog>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;

        // 1. Listen for connection requests (Simplified query to avoid index issues)
        const q = query(
            collection(db, "connections"),
            where("leaderEmail", "==", user.email)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allConns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Connection));
            // Filter status in JavaScript for now
            const connList = allConns.filter(c => c.status === "pending" || c.status === "accepted");

            setConnections(connList);
            setLoading(false);

            // 2. Fetch today's logs for accepted members
            const acceptedMembers = connList.filter(c => c.status === 'accepted').map(c => c.memberUid);
            if (acceptedMembers.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                // Note: Firestore 'in' query limited to 10. For larger teams, needs different approach.
                const logQ = query(
                    collection(db, "daily_logs"),
                    where("uid", "in", acceptedMembers.slice(0, 10)),
                    where("date", "==", today)
                );

                getDocs(logQ).then(logSnap => {
                    const logs: Record<string, DailyLog> = {};
                    logSnap.forEach(d => {
                        logs[d.data().uid] = d.data() as DailyLog;
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

    if (loading) return <div className="p-8 text-center text-slate-500">불러오는 중...</div>;

    const pendingRequests = connections.filter(c => c.status === 'pending');
    const teamMembers = connections.filter(c => c.status === 'accepted');

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-outfit text-white">팀 모니터링</h1>
                    <p className="text-slate-400">팀원들의 활동 현황을 실시간으로 확인하세요.</p>
                </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider px-2">승인 대기 중</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="glass-card p-4 flex items-center justify-between border-orange-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{req.memberName}</p>
                                        <p className="text-xs text-slate-400">{req.memberEmail}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusChange(req.id, 'accepted')}
                                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(req.id, 'rejected')}
                                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team List */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">나의 팀원 ({teamMembers.length})</h2>
                <div className="space-y-4">
                    {teamMembers.length > 0 ? teamMembers.map(member => {
                        const log = teamLogs[member.memberUid];
                        return (
                            <div key={member.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-colors group">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white">{member.memberName}</p>
                                        <p className="text-xs text-slate-500">{member.memberEmail}</p>
                                        {log ? (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full">
                                                {log.work_status}
                                            </span>
                                        ) : (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded-full">
                                                미입력
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 md:flex md:gap-12 flex-1 items-center justify-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> 통화 수
                                        </p>
                                        <p className="text-sm font-bold text-slate-200">
                                            {log?.call_actual || 0} / {log?.call_target || '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right md:text-left">
                                        <p className="text-[10px] text-slate-500 uppercase flex items-center justify-end md:justify-start gap-1">
                                            <BarChart3 className="w-3 h-3" /> 오늘 실적
                                        </p>
                                        <p className="text-sm font-bold text-blue-400">
                                            {formatCurrency(log?.performance_amount || 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="glass-card p-12 text-center text-slate-500 space-y-2">
                            <p className="text-lg font-medium">관리 중인 팀원이 없습니다.</p>
                            <p className="text-sm">설계사 계정에서 팀장님의 이메일을 등록해달라고 요청하세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
