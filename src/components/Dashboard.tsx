"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Phone, CheckCircle, User, Settings, BarChart3, Quote, Sparkles, LayoutDashboard, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { DailyLogForm } from "./DailyLogForm";
import { LeaderSettings } from "./LeaderSettings";
import { LeaderDashboard } from "./LeaderDashboard";
import { MonthlyGoalSettings } from "./MonthlyGoalSettings";
import { useLogs } from "@/hooks/useLogs";
import { DailyLog } from "@/lib/types";

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

    if (viewMode === 'leader') {
        return (
            <>
                <LeaderDashboard />
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl p-1.5 flex gap-1 rounded-[16px] shadow-2xl border border-[var(--oat-border)] z-40">
                    <button
                        onClick={() => setViewMode('agent')}
                        className="px-6 py-2.5 rounded-[12px] text-slate-500 hover:text-[var(--off-black)] transition-all font-outfit font-bold flex items-center gap-2"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button className="px-6 py-2.5 rounded-[12px] bg-[var(--off-black)] text-white font-outfit font-bold shadow-lg shadow-black/10 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team View
                    </button>
                </div>
            </>
        );
    }

    const stats = {
        monthlyGoalAmount: profile?.monthly_goal_amount || 10000000,
        monthlyGoalCases: profile?.monthly_goal_cases || 50,
        monthlyActualCalls: monthlyStats.totalCalls,
    };

    const callProgress = (stats.monthlyActualCalls / stats.monthlyGoalCases) * 100;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 pb-40">
            {/* Header */}
            <div className="flex justify-between items-center group">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold font-outfit text-[var(--off-black)]">
                        반갑습니다, <span className="text-[var(--fin-orange)]">{profile?.email?.split('@')[0]}</span>님
                    </h1>
                    <p className="text-[var(--muted-sand)] text-lg font-medium">오늘의 한 걸음이 당신의 성장이 됩니다.</p>
                </div>
                <div className="w-14 h-14 rounded-[12px] bg-[var(--off-black)] flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                    <User className="w-7 h-7 text-[var(--canvas)]" />
                </div>
            </div>

            {/* Motivational Banner (Premium Editorial Layout) */}
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
                <div className="premium-card p-8 space-y-6 hover:translate-y-[-4px] transition-all">
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
                        <div className="flex justify-between items-end">
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-[10px] text-[var(--muted-sand)] font-bold uppercase mb-1">Current</p>
                                    <p className="text-lg font-bold text-[var(--off-black)]">{stats.monthlyActualCalls} 건</p>
                                </div>
                                <div className="w-[1px] h-8 bg-[var(--oat-border)] self-center" />
                                <div>
                                    <p className="text-[10px] text-[var(--muted-sand)] font-bold uppercase mb-1">Target</p>
                                    <p className="text-lg font-medium text-[var(--muted-sand)]">{stats.monthlyGoalCases} 건</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-[var(--fin-orange)]" />
                    <h2 className="text-2xl font-bold font-outfit text-[var(--off-black)] uppercase tracking-tight">주요 활동 바로가기</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <button
                        onClick={() => setShowLogForm(true)}
                        className="premium-card p-8 flex flex-col items-center gap-4 hover:border-[var(--fin-orange)] hover:scale-[1.05] group"
                    >
                        <div className="w-14 h-14 rounded-[12px] bg-slate-50 flex items-center justify-center text-[var(--off-black)] group-hover:bg-[var(--off-black)] group-hover:text-white transition-all duration-500">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <span className="text-sm font-bold text-[var(--off-black)] tracking-tight">영업 기록 입력</span>
                    </button>
                    <button className="premium-card p-8 flex flex-col items-center gap-4 hover:border-green-500 hover:scale-[1.05] group">
                        <div className="w-14 h-14 rounded-[12px] bg-slate-50 flex items-center justify-center text-[var(--off-black)] group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                            <CheckCircle className="w-7 h-7" />
                        </div>
                        <span className="text-sm font-bold text-[var(--off-black)] tracking-tight">활동 성과 분석</span>
                    </button>
                    <button
                        onClick={() => setShowGoalSettings(true)}
                        className="premium-card p-8 flex flex-col items-center gap-4 hover:border-blue-500 hover:scale-[1.05] group"
                    >
                        <div className="w-14 h-14 rounded-[12px] bg-slate-50 flex items-center justify-center text-[var(--off-black)] group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <Settings className="w-7 h-7" />
                        </div>
                        <span className="text-sm font-bold text-[var(--off-black)] tracking-tight">목표 수치 설정</span>
                    </button>
                    <button
                        onClick={() => setShowLeaderSettings(true)}
                        className="premium-card p-8 flex flex-col items-center gap-4 hover:border-purple-500 hover:scale-[1.05] group"
                    >
                        <div className="w-14 h-14 rounded-[12px] bg-slate-50 flex items-center justify-center text-[var(--off-black)] group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                            <User className="w-7 h-7" />
                        </div>
                        <span className="text-sm font-bold text-[var(--off-black)] tracking-tight">팀장 연결 관리</span>
                    </button>
                </div>
            </div>

            {/* Navigation Bar - Desktop/Bottom */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl p-2 flex gap-2 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[var(--oat-border)] z-40">
                <button className="px-10 py-4 rounded-[14px] bg-[var(--off-black)] text-white font-bold font-outfit shadow-xl transition-all active:scale-95 flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    내 대시보드
                </button>
                <button
                    onClick={() => setViewMode('leader')}
                    className="px-10 py-4 rounded-[14px] text-[var(--muted-sand)] hover:text-[var(--off-black)] hover:bg-[var(--canvas)] transition-all font-bold font-outfit active:scale-95 flex items-center gap-3"
                >
                    <Users className="w-5 h-5" />
                    팀 모니터링
                </button>
            </div>

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
