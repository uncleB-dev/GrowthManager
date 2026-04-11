"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Check, X, User, ArrowRight, BarChart3, Phone, MessageSquare, Calendar, Edit2, Clock } from "lucide-react";
import { Connection, DailyLog, UserProfile } from "@/lib/types";
import { useLogs } from "@/hooks/useLogs";

export function LeaderDashboard() {
    const { user } = useAuth();
    const { getMonthlyLogs } = useLogs();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [teamLogs, setTeamLogs] = useState<Record<string, DailyLog>>({});
    const [teamProfiles, setTeamProfiles] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);

    // Member History Modal State
    const [selectedMember, setSelectedMember] = useState<{ uid: string, name: string } | null>(null);
    const [memberHistory, setMemberHistory] = useState<DailyLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

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

            const acceptedMembers = connList.filter(c => c.status === 'accepted');
            if (acceptedMembers.length > 0) {
                const today = new Date().toISOString().split('T')[0];

                acceptedMembers.forEach(async (member) => {
                    const memberUid = member.memberUid;

                    // Fetch Today's Log
                    const logId = `${memberUid}_${today}`;
                    const logDoc = await getDoc(doc(db, "daily_logs", logId));
                    if (logDoc.exists()) {
                        setTeamLogs(prev => ({ ...prev, [memberUid]: logDoc.data() as DailyLog }));
                    }

                    // Fetch Member Profile for Real-time Status Persistence
                    const profDoc = await getDoc(doc(db, "profiles", memberUid));
                    if (profDoc.exists()) {
                        setTeamProfiles(prev => ({ ...prev, [memberUid]: profDoc.data() as Profile }));
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleViewHistory = async (memberUid: string, memberName: string) => {
        setSelectedMember({ uid: memberUid, name: memberName });
        setHistoryLoading(true);
        const logs = await getMonthlyLogs(memberUid);
        setMemberHistory(logs);
        setHistoryLoading(false);
    };

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
                        const profile = teamProfiles[member.memberUid];
                        // 실시간 상태는 프로필에서, 나머지 수치는 오늘 로그에서
                        const currentStatus = profile?.current_status || log?.work_status || "퇴근";
                        const currentTarget = profile?.current_call_target || log?.call_target || 0;

                        return (
                            <button
                                key={member.id}
                                onClick={() => handleViewHistory(member.memberUid, member.memberName)}
                                className="premium-card w-full p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:translate-x-1 transition-all group border-l-[6px] border-l-[var(--oat-border)] hover:border-l-[var(--fin-orange)] text-left"
                            >
                                <div className="flex items-center gap-5 min-w-[250px]">
                                    <div className="w-14 h-14 rounded-[16px] bg-[var(--canvas)] flex items-center justify-center text-[var(--off-black)] shadow-inner">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-bold text-[var(--off-black)]">{member.memberName}</p>
                                        <p className="text-xs text-[var(--muted-sand)] font-medium">{member.memberEmail}</p>
                                        <div className="pt-2 flex gap-2">
                                            <span className={`px-3 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${currentStatus === '출근' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                }`}>
                                                {currentStatus}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100 uppercase tracking-wider">
                                                목표 {currentTarget}건
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-10 flex-1 items-center justify-end">
                                    <div className="space-y-2">
                                        <p className="text-[11px] text-[var(--muted-sand)] uppercase font-bold tracking-widest flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" /> 오늘 연결
                                        </p>
                                        <p className="text-lg font-bold text-[var(--off-black)] font-outfit">
                                            {log?.call_actual || 0} <span className="text-[var(--muted-sand)] text-xs font-medium">/ {currentTarget}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[11px] text-[var(--muted-sand)] uppercase font-bold tracking-widest flex items-center gap-2">
                                            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> 오늘 시도
                                        </p>
                                        <p className="text-lg font-bold text-indigo-600 font-outfit">
                                            {log?.call_attempts || 0}
                                        </p>
                                    </div>
                                    <div className="hidden lg:block space-y-2 max-w-[220px]">
                                        <p className="text-[11px] text-[var(--muted-sand)] uppercase font-bold tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" /> 오늘의 메모
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
                            </button>
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

            {/* Member History Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="premium-card w-full max-w-4xl p-10 space-y-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-[var(--oat-border)] pb-8 sticky top-0 bg-white z-10 -mt-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="h-[2px] w-8 bg-indigo-500" />
                                    <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-[0.2em] font-outfit">Team Member Insights</h2>
                                </div>
                                <h2 className="text-3xl font-bold font-outfit text-[var(--off-black)] tracking-tight">
                                    {selectedMember.name} 님의 기록 히스토리
                                </h2>
                                <p className="text-sm text-[var(--muted-sand)] font-medium">이번 달의 모든 성과를 한눈에 검토하세요.</p>
                            </div>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="p-3 hover:bg-[var(--canvas)] rounded-full transition-all text-[var(--muted-sand)] hover:text-[var(--off-black)] border border-[var(--oat-border)]"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        {historyLoading ? (
                            <div className="p-32 text-center text-[var(--muted-sand)] font-medium">히스토리를 정밀하게 로드하는 중입니다...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                {memberHistory.length > 0 ? memberHistory.map((log) => (
                                    <div
                                        key={log.date}
                                        className="premium-card p-8 flex flex-col gap-6 border-l-[4px] border-l-indigo-100 hover:border-l-indigo-400 transition-all bg-canvas/30"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                    <p className="text-lg font-bold text-[var(--off-black)] font-outfit">{log.date}</p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-widest ${log.work_status === '출근' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                        }`}>
                                                        {log.work_status || '미입력'}
                                                    </span>
                                                    <span className="text-[10px] text-[var(--muted-sand)] font-bold uppercase tracking-widest">
                                                        목표 {log.call_target || 0}건
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 border-y border-[var(--oat-border)]/30 py-5">
                                            <div className="text-center">
                                                <p className="text-[10px] text-[var(--muted-sand)] font-bold uppercase mb-1">시도</p>
                                                <p className="text-base font-bold text-indigo-600 font-outfit">{log.call_attempts || 0}</p>
                                            </div>
                                            <div className="text-center border-x border-[var(--oat-border)]/30 px-4">
                                                <p className="text-[10px] text-[var(--muted-sand)] font-bold uppercase mb-1">연결</p>
                                                <p className="text-base font-bold text-green-600 font-outfit">{log.call_actual || 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-[var(--muted-sand)] font-bold uppercase mb-1">부재</p>
                                                <p className="text-base font-bold text-orange-600 font-outfit">{log.missed_calls || 0}</p>
                                            </div>
                                        </div>

                                        {log.memo && (
                                            <div className="bg-white p-4 rounded-[12px] border border-dashed border-[var(--oat-border)] shadow-sm">
                                                <p className="text-xs text-[var(--off-black)] font-medium leading-relaxed italic">&ldquo;{log.memo}&rdquo;</p>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="md:col-span-2 p-24 border-2 border-dashed border-[var(--oat-border)] rounded-[20px] text-center space-y-4">
                                        <Calendar className="w-12 h-12 text-[var(--oat-border)] mx-auto" />
                                        <p className="text-[var(--muted-sand)] font-medium">이 팀원의 이번 달 기록이 아직 존재하지 않습니다.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-[var(--oat-border)]/50 sticky bottom-0 bg-white pb-2 flex justify-end">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="btn-gentle px-10 py-4 text-sm font-bold shadow-lg"
                            >
                                창 닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
