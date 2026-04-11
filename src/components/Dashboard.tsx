"use client";

import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Phone, CheckCircle, User, Settings, BarChart3, Loader2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { DailyLogForm } from "./DailyLogForm";
import { LeaderSettings } from "./LeaderSettings";
import { LeaderDashboard } from "./LeaderDashboard";
import { MonthlyGoalSettings } from "./MonthlyGoalSettings";
import { useLogs } from "@/hooks/useLogs";

export function Dashboard() {
    const { profile } = useAuth();
    const { getTodayLog } = useLogs();
    const [showLogForm, setShowLogForm] = useState(false);
    const [showLeaderSettings, setShowLeaderSettings] = useState(false);
    const [showGoalSettings, setShowGoalSettings] = useState(false);
    const [viewMode, setViewMode] = useState<'agent' | 'leader'>('agent');
    const [todayData, setTodayData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTodayLog().then((log) => {
            setTodayData(log);
            setLoading(false);
        });
    }, [showLogForm]);

    if (viewMode === 'leader') {
        return (
            <>
                <LeaderDashboard />
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card p-2 flex gap-4 border-slate-700/50 shadow-2xl backdrop-blur-xl">
                    <button onClick={() => setViewMode('agent')} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white transition-colors font-medium">Dashboard</button>
                    <button className="px-6 py-2 rounded-xl bg-purple-600 text-white font-medium">Team View</button>
                </div>
            </>
        );
    }

    // Real calculations based on profile and todayData
    const stats = {
        monthlyGoal: profile?.monthly_goal_amount || 10000000,
        monthlyActual: 3500000, // TODO: Implement monthly aggregation
        dailyCallGoal: todayData?.call_target || 50,
        dailyCallActual: todayData?.call_actual || 0,
    };

    const progress = (stats.monthlyActual / stats.monthlyGoal) * 100;
    const callProgress = (stats.dailyCallActual / stats.dailyCallGoal) * 100;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-outfit text-white">반갑습니다, {profile?.email?.split('@')[0]}님</h1>
                    <p className="text-slate-400">오늘의 영업 활동을 관리해보세요.</p>
                </div>
                <div className="p-2 glass-card rounded-full">
                    <User className="w-6 h-6 text-blue-400" />
                </div>
            </div>

            {/* Monthly Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-300 font-medium flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            월간 상령 달성률
                        </h3>
                        <span className="text-blue-400 font-bold">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">{formatCurrency(stats.monthlyActual)}</span>
                            <span className="text-slate-200">{formatCurrency(stats.monthlyGoal)}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-slate-300 font-medium flex items-center gap-2">
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
                            <span className="text-slate-400">{stats.dailyCallActual} 콜</span>
                            <span className="text-slate-200">{stats.dailyCallGoal} 콜</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold font-outfit text-white">주요 활동</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                        onClick={() => setShowLogForm(true)}
                        className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-slate-800/50 transition-all active:scale-95 group text-slate-100"
                    >
                        <BarChart3 className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">실적 입력</span>
                    </button>
                    <button className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-slate-800/50 transition-all active:scale-95 group">
                        <CheckCircle className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">활동 요약</span>
                    </button>
                    <button
                        onClick={() => setShowGoalSettings(true)}
                        className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-slate-800/50 transition-all active:scale-95 group text-slate-100"
                    >
                        <Settings className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">목표 설정</span>
                    </button>
                    <button
                        onClick={() => setShowLeaderSettings(true)}
                        className="glass-card p-4 flex flex-col items-center gap-2 hover:bg-slate-800/50 transition-all active:scale-95 group text-slate-100"
                    >
                        <User className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">팀장 설정</span>
                    </button>
                </div>
            </div>

            {/* Navigation Bar - Mobile */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card p-2 flex gap-4 border-slate-700/50 shadow-2xl backdrop-blur-xl">
                <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium">Dashboard</button>
                <button onClick={() => setViewMode('leader')} className="px-6 py-2 rounded-xl text-slate-400 hover:text-white transition-colors font-medium">Team View</button>
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
