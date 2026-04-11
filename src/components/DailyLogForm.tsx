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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="glass-card w-full max-w-lg p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">오늘의 영업 기록</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">근무 상태</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {["출근", "외근", "교육", "휴가"].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, work_status: status })}
                                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${formData.work_status === status
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-slate-800"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Target className="w-3 h-3" /> 오늘 콜 목표
                            </label>
                            <input
                                type="number"
                                className="glass-input w-full h-12 text-lg font-bold font-outfit"
                                value={formData.call_target}
                                onChange={(e) => setFormData({ ...formData, call_target: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-purple-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <PhoneCall className="w-3 h-3" /> 시도 콜 수
                            </label>
                            <input
                                type="number"
                                className="glass-input w-full h-12 text-lg font-bold font-outfit text-purple-400"
                                value={formData.call_attempts}
                                onChange={(e) => setFormData({ ...formData, call_attempts: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-green-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <PhoneForwarded className="w-3 h-3" /> 연결 콜 수
                            </label>
                            <input
                                type="number"
                                className="glass-input w-full h-12 text-lg font-bold font-outfit text-green-400"
                                value={formData.call_actual}
                                onChange={(e) => setFormData({ ...formData, call_actual: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-orange-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                <PhoneOff className="w-3 h-3" /> 부재 콜 수
                            </label>
                            <input
                                type="number"
                                className="glass-input w-full h-12 text-lg font-bold font-outfit text-orange-400"
                                value={formData.missed_calls}
                                onChange={(e) => setFormData({ ...formData, missed_calls: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Memo */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3" /> 메모 (팀장 요청사항 포함)
                        </label>
                        <textarea
                            className="glass-input w-full h-32 p-4 text-sm font-medium resize-none leading-relaxed"
                            placeholder="오늘의 특이사항이나 팀장님께 요청할 내용을 적어주세요."
                            value={formData.memo}
                            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-[2] py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${isSaved
                                    ? "bg-green-600 text-white shadow-green-500/20"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                }`}
                        >
                            {isSaved ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>저장 완료</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{loading ? "저장 중..." : "기록 저장하기"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
