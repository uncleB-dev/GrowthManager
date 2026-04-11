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
        await updateDoc(doc(db, "members", user.uid), {
            monthly_goal_amount: goalAmount,
            monthly_goal_cases: goalCases,
        });
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-300">
            <div className="premium-card w-full max-w-md p-8 md:p-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                <div className="flex justify-between items-center border-b border-[var(--oat-border)] pb-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-outfit text-[var(--off-black)]">월간 목표 설정</h2>
                        <p className="text-xs text-[var(--muted-sand)] font-medium">당신의 비전을 구체적인 수치로 입력하세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--canvas)] rounded-full transition-all text-[var(--muted-sand)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-wider flex items-center gap-2 px-1">
                                <CircleDollarSign className="w-4 h-4 text-blue-500" /> 월간 목표 실적 (원)
                            </label>
                            <input
                                type="number"
                                className="premium-input w-full h-14 text-xl font-bold font-outfit text-blue-600"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-wider flex items-center gap-2 px-1">
                                <Hash className="w-4 h-4 text-[var(--fin-orange)]" /> 월간 목표 건수
                            </label>
                            <input
                                type="number"
                                className="premium-input w-full h-14 text-xl font-bold font-outfit text-[var(--fin-orange)]"
                                value={goalCases}
                                onChange={(e) => setGoalCases(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-gentle flex-1 py-4 text-sm font-bold active:scale-95"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-premium flex-[2] py-4 flex items-center justify-center gap-2 font-bold active:scale-95 shadow-xl disabled:opacity-50"
                        >
                            <Target className="w-5 h-5" />
                            {loading ? "데이터 저장 중..." : "목표 확정하기"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
