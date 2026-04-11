"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { User, Settings, BarChart3, Quote, Sparkles, LayoutDashboard, Users, LogOut, ChevronDown, ListChecks, Calendar, Clock, Edit2 } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { DailyLogForm } from "./DailyLogForm";
import { LeaderSettings } from "./LeaderSettings";
import { LeaderDashboard } from "./LeaderDashboard";
import { MonthlyGoalSettings } from "./MonthlyGoalSettings";
import { useLogs } from "@/hooks/useLogs";
import { DailyLog } from "@/lib/types";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const MOTIVATIONAL_QUOTES = [
    "열정은 모든 능력보다 낫다. - 찰스 M. 슈왑",
    "성공으로 가는 길은 항상 공사 중이다. - 릴리 톰린",
    "어제와 똑같이 살면서 다른 미래를 기대하는 것은 정신병 초기 증세이다. - 아인슈타인",
    "거절은 '안 된다'는 뜻이 아니라 '아직 아니다'라는 뜻이다. - 판매의 고수 중",
    "가장 큰 위험은 위험을 감수하지 않는 것이다. - 마크 저커버그",
    "오늘 당신이 쏟은 땀방울은 내일 당신의 자부심이 될 것입니다.",
    "목표가 없는 사람은 목표가 있는 사람을 위해 일하게 된다.",
    "성공은 결코 최종적이지 않으며, 실패는 결코 치명적이지 않다. 중요한 것은 지속하는 용기다."
];

const WORK_STATUS_OPTIONS = ["출근", "퇴근", "교육", "재택", "외근", "병원", "휴무"];

export function Dashboard() {
    const { profile, user } = useAuth();
    const { getTodayLog, saveLog, getMonthlyStats, getMonthlyLogs, loading: logsLoading } = useLogs();
    const [showLogForm, setShowLogForm] = useState(false);
    const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
    const [showLeaderSettings, setShowLeaderSettings] = useState(false);
    const [showGoalSettings, setShowGoalSettings] = useState(false);
    const [viewMode, setViewMode] = useState<'agent' | 'leader'>('agent');

    // Today's specific data - Initial value: "퇴근"
    const [todayStatus, setTodayStatus] = useState("퇴근");
    const [todayCallTarget, setTodayCallTarget] = useState(0);
    const [monthlyStats, setMonthlyStats] = useState({ totalCalls: 0 });
    const [monthlyHistory, setMonthlyHistory] = useState<DailyLog[]>([]);

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const randomQuote = useMemo(() => {
        return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }, []);

    // 영속성 데이터 동기화: 프로필 데이터가 로드되면 상태 업데이트
    useEffect(() => {
        if (profile) {
            setTodayStatus(profile.current_status || "퇴근");
            setTodayCallTarget(profile.current_call_target || 0);
        }
    }, [profile]);

    const fetchAllData = () => {
        if (!user) return;
        getTodayLog().then((log) => {
            if (log) {
                // 오늘 저장된 로그가 있으면 덮어씌움 (우선순위: 프로필 < 오늘 로그)
                if (log.work_status) setTodayStatus(log.work_status);
                if (log.call_target !== undefined) setTodayCallTarget(log.call_target);
            }
        });
        getMonthlyStats().then(stats => {
            setMonthlyStats(stats);
        });
        getMonthlyLogs().then(logs => {
            setMonthlyHistory(logs);
        });
    };

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user, showLogForm, editingLog]); // eslint-disable-line

    const handleQuickSave = async () => {
        setSaveLoading(true);
        await saveLog({ work_status: todayStatus, call_target: todayCallTarget });
        setSaveLoading(false);
        fetchAllData();
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        signOut(auth);
    };

    const stats = {
        monthlyGoalAmount: profile?.monthly_goal_amount || 0,
        monthlyGoalCases: profile?.monthly_goal_cases || 0,
        monthlyActualCalls: monthlyStats.totalCalls,
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-40 min-h-screen bg-canvas font-inter">
            {/* Optimized Navigation Header */}
            <div className="flex justify-between items-center py-4 border-b border-[var(--oat-border)]/50 mb-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-outfit text-[var(--off-black)] tracking-tight">
                        Growth<span className="text-[var(--fin-orange)]">Manager</span>
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 sm:gap-6">
                        {/* Desktop View Toggle */}
                        <div className="hidden sm:flex bg-[var(--canvas)] p-1 rounded-[14px] border border-[var(--oat-border)]">
                            <button
                                onClick={() => setViewMode('agent')}
                                className={`px-6 py-2 rounded-[10px] text-sm font-bold font-outfit transition-all flex items-center gap-2 ${viewMode === 'agent'
                                    ? "bg-[var(--off-black)] text-white shadow-lg"
                                    : "text-[var(--muted-sand)] hover:text-[var(--off-black)]"
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => setViewMode('leader')}
                                className={`px-6 py-2 rounded-[10px] text-sm font-bold font-outfit transition-all flex items-center gap-2 ${viewMode === 'leader'
                                    ? "bg-[var(--off-black)] text-white shadow-lg"
                                    : "text-[var(--muted-sand)] hover:text-[var(--off-black)]"
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                Team
                            </button>
                        </div>

                        {/* Mobile View Toggle - Compact Icon Style */}
                        <div className="flex sm:hidden bg-[var(--canvas)] p-1 rounded-[10px] border border-[var(--oat-border)]">
                            <button
                                onClick={() => setViewMode('agent')}
                                className={`p-2 rounded-[6px] transition-all ${viewMode === 'agent'
                                    ? "bg-[var(--off-black)] text-white shadow-md scale-110"
                                    : "text-[var(--muted-sand)]"
                                    }`}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('leader')}
                                className={`p-2 rounded-[6px] transition-all ${viewMode === 'leader'
                                    ? "bg-[var(--off-black)] text-white shadow-md scale-110"
                                    : "text-[var(--muted-sand)]"
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 p-1 pr-3 hover:bg-[var(--canvas)] rounded-full transition-all border border-transparent hover:border-[var(--oat-border)]"
                            >
                                <div className="w-10 h-10 rounded-full bg-[var(--off-black)] flex items-center justify-center text-white shadow-lg">
                                    <User className="w-5 h-5" />
                                </div>
                                <ChevronDown className={`w-4 h-4 text-[var(--muted-sand)] transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-3 w-72 bg-white rounded-[20px] shadow-[0_20px_60px_rgba(17,17,17,0.12)] border border-[var(--oat-border)] z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="p-6 bg-[var(--canvas)]/50 border-b border-[var(--oat-border)]/50">
                                        <p className="text-[10px] font-bold text-[var(--muted-sand)] uppercase tracking-widest mb-1">Signed in as</p>
                                        <p className="text-sm font-bold text-[var(--off-black)] truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <button
                                            onClick={() => { setShowLeaderSettings(true); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--off-black)] hover:bg-[var(--canvas)] rounded-[12px] transition-all group"
                                        >
                                            <Users className="w-4 h-4 text-[var(--muted-sand)] group-hover:text-[var(--fin-orange)]" />
                                            팀장 연결 관리
                                        </button>
                                        <div className="h-[1px] bg-[var(--oat-border)]/30 my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-[12px] transition-all group"
                                        >
                                            <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                                            시스템 로그아웃
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {viewMode === 'leader' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <LeaderDashboard />
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Welcome Header */}
                        <div className="space-y-1">
                            <h2 className="text-4xl font-bold font-outfit text-[var(--off-black)] tracking-tight">
                                반갑습니다, <span className="text-[var(--fin-orange)]">{user?.email?.split('@')[0]}</span>님
                            </h2>
                            <p className="text-[var(--muted-sand)] text-lg font-medium">오늘의 성장을 위해 정중히 환영합니다.</p>
                        </div>

                        {/* Motivational Banner */}
                        <div className="premium-card p-10 border-l-[6px] border-l-[var(--fin-orange)] bg-[#fffdfa] relative overflow-hidden group">
                            <Quote className="absolute -bottom-6 -right-6 w-40 h-40 text-[var(--fin-orange)]/5 group-hover:scale-110 transition-transform duration-700" />
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="w-5 h-5 text-[var(--fin-orange)]" />
                                <span className="text-xs font-bold text-[var(--fin-orange)] uppercase tracking-[0.2em] font-outfit">Today&apos;s Wisdom</span>
                            </div>
                            <p className="text-2xl font-serif font-medium text-[var(--off-black)] leading-[1.4] max-w-3xl relative z-10 italic">
                                &ldquo;{randomQuote}&rdquo;
                            </p>
                        </div>

                        {/* Stats Grid - V4 Revamp */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Monthly Goal Card */}
                            <div className="premium-card p-10 space-y-8 relative overflow-hidden group">
                                <button
                                    onClick={() => setShowGoalSettings(true)}
                                    className="absolute top-10 right-10 p-2.5 rounded-full border border-[var(--oat-border)] hover:bg-[var(--off-black)] hover:text-white transition-all duration-300 shadow-sm z-10"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                <h3 className="text-[var(--off-black)] text-2xl font-bold flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 rounded-[12px] shadow-sm">
                                        <BarChart3 className="w-7 h-7 text-blue-500" />
                                    </div>
                                    이번 달 목표
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="p-6 bg-[var(--canvas)] rounded-[16px] border border-[var(--oat-border)]/50 group-hover:border-blue-200 transition-colors flex flex-col justify-center overflow-hidden">
                                        <p className="text-xs text-[var(--muted-sand)] uppercase font-bold tracking-[0.2em] mb-3">목표 실적</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-[var(--off-black)] font-outfit truncate whitespace-nowrap" title={formatCurrency(stats.monthlyGoalAmount)}>
                                            {formatCurrency(stats.monthlyGoalAmount)}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-[var(--off-black)] rounded-[16px] text-white shadow-xl shadow-black/10 flex flex-col justify-center overflow-hidden">
                                        <p className="text-xs text-white/60 uppercase font-bold tracking-[0.2em] mb-3">목표 콜 수 / 시행 콜 수</p>
                                        <p className="text-2xl sm:text-3xl font-bold font-outfit tracking-tighter truncate whitespace-nowrap">
                                            {stats.monthlyGoalCases} 건 <span className="text-white/40 font-light mx-2">/</span> {stats.monthlyActualCalls} 건
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Today's Status Card - New V4 */}
                            <div className="premium-card p-10 space-y-8 border-l-[6px] border-l-green-500">
                                <h3 className="text-[var(--off-black)] text-2xl font-bold flex items-center gap-4">
                                    <div className="p-3 bg-green-50 rounded-[12px] shadow-sm">
                                        <Clock className="w-7 h-7 text-green-500" />
                                    </div>
                                    오늘의 활동 설정
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex flex-wrap gap-2">
                                        {WORK_STATUS_OPTIONS.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setTodayStatus(status)}
                                                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${todayStatus === status
                                                    ? "bg-green-600 text-white border-green-600 shadow-lg scale-105"
                                                    : "bg-white text-[var(--muted-sand)] border-[var(--oat-border)] hover:bg-[var(--canvas)]"
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-widest px-1">오늘 콜 목표 (건)</label>
                                            <input
                                                type="number"
                                                value={todayCallTarget}
                                                onChange={(e) => setTodayCallTarget(parseInt(e.target.value) || 0)}
                                                className="premium-input w-full h-14 text-2xl font-bold font-outfit"
                                                placeholder="0"
                                            />
                                        </div>
                                        <button
                                            onClick={handleQuickSave}
                                            disabled={saveLoading}
                                            className="h-14 px-8 bg-[var(--off-black)] text-white font-bold rounded-[8px] hover:bg-[#313130] transition-all shadow-xl disabled:opacity-50 active:scale-95"
                                        >
                                            {saveLoading ? "저장 중..." : "상태 저장"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Record Button */}
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <button
                                onClick={() => setShowLogForm(true)}
                                className="btn-premium py-6 px-16 text-xl rounded-full shadow-2xl hover:scale-[1.05] transition-all group w-full max-w-2xl bg-gradient-to-r from-[var(--off-black)] to-slate-800"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <ListChecks className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                    <span>오늘의 영업 기록 입력하기</span>
                                </div>
                            </button>
                        </div>

                        {/* Monthly History Section */}
                        <div className="space-y-8 pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] w-10 bg-[var(--fin-orange)]" />
                                    <h3 className="text-2xl font-bold font-outfit text-[var(--off-black)] uppercase tracking-tight">이번 달 기록 히스토리</h3>
                                </div>
                                <Calendar className="text-[var(--oat-border)] w-6 h-6" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {monthlyHistory.length > 0 ? (
                                    monthlyHistory.map((log) => (
                                        <button
                                            key={log.date}
                                            onClick={() => setEditingLog(log)}
                                            className="premium-card p-8 flex flex-col gap-6 text-left hover:border-[var(--fin-orange)] hover:translate-y-[-2px] transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-[var(--off-black)] font-outfit">{log.date}</p>
                                                    <p className="text-xs text-[var(--muted-sand)] font-bold uppercase tracking-widest">{log.work_status || '상태 미입력'}</p>
                                                </div>
                                                <div className="p-2 rounded-full border border-[var(--oat-border)] group-hover:bg-[var(--fin-orange)] group-hover:text-white transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 border-y border-[var(--oat-border)]/30 py-4">
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
                                                <div className="bg-[var(--canvas)] p-4 rounded-[12px] border border-dashed border-[var(--oat-border)]">
                                                    <p className="text-xs text-[var(--off-black)] font-medium leading-relaxed italic line-clamp-2">&ldquo;{log.memo}&rdquo;</p>
                                                </div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="md:col-span-2 p-20 border-2 border-dashed border-[var(--oat-border)] rounded-[20px] text-center space-y-4">
                                        <Calendar className="w-12 h-12 text-[var(--oat-border)] mx-auto" />
                                        <p className="text-[var(--muted-sand)] font-medium">이번 달 기록이 존재하지 않습니다.<br />상단의 버튼을 눌러 첫 기록을 남겨보세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {showLogForm && (
                    <DailyLogForm
                        onClose={() => setShowLogForm(false)}
                        onSaved={() => fetchAllData()}
                    />
                )}
                {editingLog && (
                    <DailyLogForm
                        initialData={editingLog}
                        onClose={() => setEditingLog(null)}
                        onSaved={() => fetchAllData()}
                    />
                )}
                {showLeaderSettings && (
                    <LeaderSettings onClose={() => setShowLeaderSettings(false)} />
                )}
                {showGoalSettings && (
                    <MonthlyGoalSettings onClose={() => setShowGoalSettings(false)} />
                )}
            </div>
            );
}
