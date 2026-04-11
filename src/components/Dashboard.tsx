"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Phone, CheckCircle, User, Settings, BarChart3, Quote, Sparkles, LayoutDashboard, Users, LogOut, ChevronDown, ListChecks } from "lucide-react";
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

export function Dashboard() {
    const { profile } = useAuth();
    const { getTodayLog, getMonthlyStats } = useLogs();
    const [showLogForm, setShowLogForm] = useState(false);
    const [showLeaderSettings, setShowLeaderSettings] = useState(false);
    const [showGoalSettings, setShowGoalSettings] = useState(false);
    const [viewMode, setViewMode] = useState<'agent' | 'leader'>('agent');
    const [todayData, setTodayData] = useState<DailyLog | null>(null);
    const [monthlyStats, setMonthlyStats] = useState({ totalCalls: 0 });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const randomQuote = useMemo(() => {
        return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }, []);

    useEffect(() => {
        getTodayLog().then((log) => {
            setTodayData(log);
        });
        getMonthlyStats().then(stats => {
            setMonthlyStats(stats);
        });
    }, [getTodayLog, getMonthlyStats, showLogForm]);

    // Close menu when clicking outside
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

    const callProgress = stats.monthlyGoalCases > 0
        ? (stats.monthlyActualCalls / stats.monthlyGoalCases) * 100
        : 0;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 pb-40 min-h-screen bg-canvas">
            {/* Optimized Navigation Header */}
            <div className="flex justify-between items-center py-4 border-b border-[var(--oat-border)]/50 mb-10">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold font-outfit text-[var(--off-black)] tracking-tight">
                        Growth<span className="text-[var(--fin-orange)]">Manager</span>
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* View Switch Toggle */}
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

                    {/* Profile Menu Dropdown */}
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
                                    <p className="text-sm font-bold text-[var(--off-black)] truncate">{profile?.email}</p>
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
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Welcome Header */}
                    <div className="space-y-1">
                        <h2 className="text-4xl font-bold font-outfit text-[var(--off-black)]">
                            반갑습니다, <span className="text-[var(--fin-orange)]">{profile?.email?.split('@')[0]}</span>님
                        </h2>
                        <p className="text-[var(--muted-sand)] text-lg font-medium">당신의 성장이 오늘도 기대됩니다.</p>
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Monthly Goal Card */}
                        <div className="premium-card p-8 space-y-6 hover:translate-y-[-4px] transition-all relative group">
                            <button
                                onClick={() => setShowGoalSettings(true)}
                                className="absolute top-8 right-8 p-2 rounded-full border border-[var(--oat-border)] hover:bg-[var(--off-black)] hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="flex items-center justify-between">
                                <h3 className="text-[var(--off-black)] text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-[8px]">
                                        <BarChart3 className="w-6 h-6 text-blue-500" />
                                    </div>
                                    이번 달 목표
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-5 bg-[var(--canvas)] rounded-[12px] border border-[var(--oat-border)]/50">
                                    <p className="text-xs text-[var(--muted-sand)] uppercase font-bold tracking-wider mb-2">목표 실적</p>
                                    <p className="text-2xl font-bold text-[var(--off-black)] font-outfit">{formatCurrency(stats.monthlyGoalAmount)}</p>
                                </div>
                                <div className="p-5 bg-[var(--canvas)] rounded-[12px] border border-[var(--oat-border)]/50">
                                    <p className="text-xs text-[var(--muted-sand)] uppercase font-bold tracking-wider mb-2">목표 콜 수</p>
                                    <p className="text-2xl font-bold text-[var(--off-black)] font-outfit">{stats.monthlyGoalCases} 건</p>
                                </div>
                            </div>
                        </div>

                        {/* Performance Card */}
                        <div className="premium-card p-8 space-y-6 hover:translate-y-[-4px] transition-all">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[var(--off-black)] text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-[8px]">
                                        <Phone className="w-6 h-6 text-[var(--fin-orange)]" />
                                    </div>
                                    어제까지 누적 성과
                                </h3>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold text-[var(--fin-orange)] font-outfit">{callProgress.toFixed(1)}%</span>
                                    <span className="text-[10px] text-[var(--muted-sand)] font-bold uppercase tracking-widest">Achievement</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--oat-border)]/30">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--fin-orange)] to-orange-400 transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(callProgress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center bg-[var(--canvas)]/50 p-4 rounded-[12px] border border-dashed border-[var(--oat-border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[var(--muted-sand)] uppercase">상세 현황</span>
                                        <div className="w-[1px] h-3 bg-[var(--oat-border)]" />
                                        <p className="text-sm font-bold text-[var(--off-black)]">
                                            목표 콜수 <span className="text-[var(--fin-orange)]">{stats.monthlyGoalCases}</span>건 / <span className="text-blue-600">{stats.monthlyActualCalls}</span>건 시행
                                        </p>
                                    </div>
                                    <ListChecks className="w-4 h-4 text-[var(--muted-sand)]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Central Entry Point */}
                    <div className="pt-10 flex justify-center">
                        <button
                            onClick={() => setShowLogForm(true)}
                            className="btn-premium py-6 px-16 text-xl rounded-full shadow-2xl hover:bg-[var(--off-black)] hover:scale-[1.05] active:scale-95 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <BarChart3 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                <span>오늘의 영업 기록 입력하기</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showLogForm && (
                <DailyLogForm onClose={() => setShowLogForm(false)} />
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
