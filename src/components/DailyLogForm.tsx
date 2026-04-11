"use client";

import { useState, useEffect } from "react";
import { useLogs } from "@/hooks/useLogs";
import { X, Plus, Trash2, Save } from "lucide-react";

export function DailyLogForm({ onClose }: { onClose: () => void }) {
    const { getTodayLog, saveLog, loading } = useLogs();
    const [formData, setFormData] = useState({
        work_status: "출근",
        call_target: 50,
        call_actual: 0,
        performance_amount: 0,
        performance_cases: 0,
        notable_outcomes: [] as { name: string; age: string; memo: string }[],
    });

    useEffect(() => {
        getTodayLog().then((log) => {
            if (log) {
                setFormData({
                    work_status: log.work_status || "출근",
                    call_target: log.call_target || 50,
                    call_actual: log.call_actual || 0,
                    performance_amount: log.performance_amount || 0,
                    performance_cases: log.performance_cases || 0,
                    notable_outcomes: log.notable_outcomes || [],
                });
            }
        });
    }, []);

    const handleAddOutcome = () => {
        setFormData({
            ...formData,
            notable_outcomes: [...formData.notable_outcomes, { name: "", age: "", memo: "" }],
        });
    };

    const handleRemoveOutcome = (index: number) => {
        const newOutcomes = [...formData.notable_outcomes];
        newOutcomes.splice(index, 1);
        setFormData({ ...formData, notable_outcomes: newOutcomes });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveLog(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-outfit text-white">오늘의 영업 기록</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">근무 상태</label>
                            <select
                                className="glass-input w-full appearance-none"
                                value={formData.work_status}
                                onChange={(e) => setFormData({ ...formData, work_status: e.target.value })}
                            >
                                <option value="출근">출근</option>
                                <option value="외근">외근</option>
                                <option value="교육">교육</option>
                                <option value="재택">재택</option>
                                <option value="휴가">휴가</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">오늘의 콜 목표</label>
                            <input
                                type="number"
                                className="glass-input w-full"
                                value={formData.call_target}
                                onChange={(e) => setFormData({ ...formData, call_target: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">실제 통화 수</label>
                            <input
                                type="number"
                                className="glass-input w-full"
                                value={formData.call_actual}
                                onChange={(e) => setFormData({ ...formData, call_actual: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">오늘의 실적 (건수)</label>
                            <input
                                type="number"
                                className="glass-input w-full"
                                value={formData.performance_cases}
                                onChange={(e) => setFormData({ ...formData, performance_cases: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">오늘의 실적 (금액/원)</label>
                        <input
                            type="number"
                            className="glass-input w-full text-blue-400 font-bold"
                            value={formData.performance_amount}
                            onChange={(e) => setFormData({ ...formData, performance_amount: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-300">주목할 만한 성과 (고객 상담)</label>
                            <button
                                type="button"
                                onClick={handleAddOutcome}
                                className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                            >
                                <Plus className="w-4 h-4" /> 추가
                            </button>
                        </div>

                        {formData.notable_outcomes.map((outcome, index) => (
                            <div key={index} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex gap-3">
                                    <input
                                        placeholder="고객 이름"
                                        className="glass-input flex-1 py-1 text-sm"
                                        value={outcome.name}
                                        onChange={(e) => {
                                            const newOutcomes = [...formData.notable_outcomes];
                                            newOutcomes[index].name = e.target.value;
                                            setFormData({ ...formData, notable_outcomes: newOutcomes });
                                        }}
                                    />
                                    <input
                                        placeholder="나이"
                                        className="glass-input w-20 py-1 text-sm"
                                        value={outcome.age}
                                        onChange={(e) => {
                                            const newOutcomes = [...formData.notable_outcomes];
                                            newOutcomes[index].age = e.target.value;
                                            setFormData({ ...formData, notable_outcomes: newOutcomes });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOutcome(index)}
                                        className="p-2 text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <textarea
                                    placeholder="상담 메모"
                                    className="glass-input w-full py-1 text-sm h-20"
                                    value={outcome.memo}
                                    onChange={(e) => {
                                        const newOutcomes = [...formData.notable_outcomes];
                                        newOutcomes[index].memo = e.target.value;
                                        setFormData({ ...formData, notable_outcomes: newOutcomes });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? "저장 중..." : "오늘 기록 저장하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}
