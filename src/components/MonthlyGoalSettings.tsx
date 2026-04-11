"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { X, Target, CircleDollarSign, Hash } from "lucide-react";

export function MonthlyGoalSettings({ onClose }: { onClose: () => void }) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [goalAmount, setGoalAmount] = useState(profile?.monthly_goal_amount || 0);
    const [goalCases, setGoalCases] = useState(profile?.monthly_goal_cases || 0);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        await updateDoc(doc(db, "members", user.id), {
            monthly_goal_amount: goalAmount,
            monthly_goal_cases: goalCases,
        });
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-outfit text-white">월간 목표 설정</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <CircleDollarSign className="w-4 h-4 text-blue-400" /> 월간 목표 실적 (원)
                            </label>
                            <input
                                type="number"
                                className="glass-input w-full text-blue-400 font-bold"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-orange-400" /> 월간 목표 건수
                            </label>
                            <input
                                type="number"
                                className="glass-input w-full text-orange-400 font-bold"
                                value={goalCases}
                                onChange={(e) => setGoalCases(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <Target className="w-5 h-5" />
                        {loading ? "저장 중..." : "목표 확정하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
