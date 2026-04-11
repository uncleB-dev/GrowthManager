"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Phone, CheckCircle, User, Settings, BarChart3, Quote, Sparkles } from "lucide-react";
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
    const { getTodayLog } = useLogs();
    const [showLogForm, setShowLogForm] = useState(false);
    const [showLeaderSettings, setShowLeaderSettings] = useState(false);
    const [showGoalSettings, setShowGoalSettings] = useState(false);
    const [viewMode, setViewMode] = useState<'agent' | 'leader'>('agent');
    const [todayData, setTodayData] = useState<DailyLog | null>(null);

    const randomQuote = useMemo(() => {
        return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }, []);

    useEffect(() => {
        getTodayLog().then((log) => {
            setTodayData(log);
        });
    }, [getTodayLog, showLogForm]);

    if (viewMode === 'leader') {
        return (
            <>
                <LeaderDashboard />
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card p-2 flex gap-4 border-slate-700/50 shadow-2xl backdrop-blur-xl z-40">
                    <button onClick={() => setViewMode('agent')} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white transition-colors font-medium">Dashboard</button>
                    <button className="px-6 py-2 rounded-xl bg-purple-600 text-white font-medium shadow-lg shadow-purple-500/20">Team View</button>
                </div>
            </>
        );
    }

    const stats = {
        monthlyGoalAmount: profile?.monthly_goal_amount || 10000000,
        monthlyGoalCases: profile?.monthly_goal_cases || 50,
        dailyCallGoal: todayData?.call_target || 50,
        dailyCallActual: todayData?.call_actual || 0,
    };

    const callProgress = (stats.dailyCallActual / stats.dailyCallGoal) * 100;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-white">반갑습니다, {profile?.email?.split('@')[0]}님</h1>
                    <p className="text-slate-400 mt-1">오늘의 한 걸음이 당신의 성장이 됩니다.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <User className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Motivational Banner */}
            <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote className="w-16 h-16 text-blue-400" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Motivational Quote</span>
                </div>
                <p className="text-lg font-medium text-slate-200 leading-relaxed max-w-2xl">
                    "{randomQuote}"
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-300 font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            이번 달 목표
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">목표 실적</p>
                            <p className="text-lg font-bold text-white font-outfit">{formatCurrency(stats.monthlyGoalAmount)}</p>
                        </div>
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">목표 콜 수</p>
                            <p className="text-lg font-bold text-white font-outfit">{stats.monthlyGoalCases} 건</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-300 font-bold flex items-center gap-2">
                            <Phone className="w-5 h-5 text-orange-400" />
                            오늘의 통화 진행률
                        </h3>
                        <span className="text-orange-400 font-bold">{callProgress.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-1000"
                                style={{ width: `${Math.min(callProgress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-bold">{stats.dailyCallActual} 연결</span>
                            <span className="text-slate-200 font-bold">{stats.dailyCallGoal} 목표</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-outfit text-white">활동 바로가기</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                        onClick={() => setShowLogForm(true)}
                        className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all active:scale-95 group border-blue-500/10"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-200">기록 입력</span>
                    </button>
                    <button className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all active:scale-95 group border-green-500/10">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-200">활동 요약</span>
                    </button>
                    <button
                        onClick={() => setShowGoalSettings(true)}
                        className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all active:scale-95 group border-slate-500/10"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                            <Settings className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-200">목표 설정</span>
                    </button>
                    <button
                        onClick={() => setShowLeaderSettings(true)}
                        className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all active:scale-95 group border-purple-500/10"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-200">팀장 설정</span>
                    </button>
                </div>
            </div>

            {/* Navigation Bar - Desktop/Bottom */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card p-2 flex gap-4 border-slate-700/50 shadow-2xl backdrop-blur-2xl z-40">
                <button className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">Dashboard</button>
                <button onClick={() => setViewMode('leader')} className="px-8 py-3 rounded-xl text-slate-400 hover:text-white transition-colors font-bold transition-all active:scale-95">Team View</button>
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
