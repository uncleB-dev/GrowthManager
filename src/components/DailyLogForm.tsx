"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/hooks/useLogs";
import { DailyLog } from "@/lib/types";
import { X, Save, PhoneCall, MessageSquare, Target, CheckCircle2, PhoneForwarded, PhoneOff } from "lucide-react";

export function DailyLogForm({ onClose }: { onClose: () => void }) {
    const { getTodayLog, saveLog, loading } = useLogs();
    const [formData, setFormData] = useState<Partial<DailyLog>>({
        work_status: "출근",
        call_target: 100,
        call_attempts: 0,
        call_actual: 0,
        missed_calls: 0,
        memo: "",
    });

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        getTodayLog().then((log) => {
            if (log) {
                setFormData({
                    work_status: log.work_status || "출근",
                    call_target: log.call_target || 100,
                    call_attempts: log.call_attempts || 0,
                    call_actual: log.call_actual || 0,
                    missed_calls: log.missed_calls || 0,
                    memo: log.memo || "",
                });
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveLog(formData);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-300">
            <div className="premium-card w-full max-w-lg p-8 md:p-10 space-y-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-[var(--oat-border)] pb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold font-outfit text-[var(--off-black)] tracking-tight">오늘의 영업 기록</h2>
                        <p className="text-sm text-[var(--muted-sand)] font-medium">수고 많으셨습니다. 오늘의 발자취를 남겨주세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-[var(--canvas)] rounded-full transition-all text-[var(--muted-sand)] hover:text-[var(--off-black)]">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Status */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-[0.2em] px-1">근무 상태</label>
                        <div className="grid grid-cols-4 gap-3">
                            {["출근", "외근", "교육", "휴가"].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, work_status: status })}
                                    className={`py-3 rounded-[8px] text-sm font-bold transition-all border ${formData.work_status === status
                                        ? "bg-[var(--off-black)] text-white border-[var(--off-black)] shadow-lg shadow-black/10 scale-[1.05]"
                                        : "bg-white text-[var(--muted-sand)] hover:bg-[var(--canvas)] hover:text-[var(--off-black)] border-[var(--oat-border)]"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-wider px-1 flex items-center gap-2">
                                <Target className="w-3.5 h-3.5" /> 오늘 콜 목표
                            </label>
                            <input
                                type="number"
                                className="premium-input w-full h-14 text-xl font-bold font-outfit"
                                value={formData.call_target}
                                onChange={(e) => setFormData({ ...formData, call_target: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider px-1 flex items-center gap-2">
                                <PhoneCall className="w-3.5 h-3.5" /> 시도 콜 수
                            </label>
                            <input
                                type="number"
                                className="premium-input w-full h-14 text-xl font-bold font-outfit border-indigo-100 focus:border-indigo-500"
                                value={formData.call_attempts}
                                onChange={(e) => setFormData({ ...formData, call_attempts: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-green-500 uppercase tracking-wider px-1 flex items-center gap-2">
                                <PhoneForwarded className="w-3.5 h-3.5" /> 연결 콜 수
                            </label>
                            <input
                                type="number"
                                className="premium-input w-full h-14 text-xl font-bold font-outfit border-green-100 focus:border-green-500 text-green-600"
                                value={formData.call_actual}
                                onChange={(e) => setFormData({ ...formData, call_actual: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-orange-500 uppercase tracking-wider px-1 flex items-center gap-2">
                                <PhoneOff className="w-3.5 h-3.5" /> 부재 콜 수
                            </label>
                            <input
                                type="number"
                                className="premium-input w-full h-14 text-xl font-bold font-outfit border-orange-100 focus:border-orange-500 text-orange-600"
                                value={formData.missed_calls}
                                onChange={(e) => setFormData({ ...formData, missed_calls: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Memo */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-wider px-1 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5" /> 메모 (팀장 요청사항 포함)
                        </label>
                        <textarea
                            className="premium-input w-full h-36 p-5 text-base font-medium resize-none leading-relaxed"
                            placeholder="오늘의 특이사항이나 팀장님께 요청할 내용을 정중히 적어주세요."
                            value={formData.memo}
                            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-gentle flex-1 py-4 text-sm font-bold active:scale-95"
                        >
                            창 닫기
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-[2] py-4 rounded-[4px] flex items-center justify-center gap-2 font-outfit font-bold transition-all shadow-xl active:scale-95 ${isSaved
                                ? "bg-green-600 text-white shadow-green-500/20"
                                : "bg-[var(--off-black)] hover:bg-[#313130] text-white shadow-black/10"
                                }`}
                        >
                            {isSaved ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>성공적으로 저장되었습니다</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{loading ? "기록을 저장하는 중..." : "오늘의 기록 저장하기"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
