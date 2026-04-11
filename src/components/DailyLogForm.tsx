import { useState, useEffect } from "react";
import { useLogs } from "@/hooks/useLogs";
import { X, Plus, Trash2, Save, PhoneOff, TrendingUp, MessageSquare, ShieldAlert } from "lucide-react";
import { NotableOutcome } from "@/lib/types";

export function DailyLogForm({ onClose }: { onClose: () => void }) {
    const { getTodayLog, saveLog, loading } = useLogs();
    const [showSales, setShowSales] = useState(false);
    const [formData, setFormData] = useState({
        work_status: "출근",
        call_target: 50,
        call_actual: 0,
        missed_calls: 0,
        performance_amount: 0,
        performance_cases: 0,
        notable_outcomes: [
            { name: "", age: "" },
            { name: "", age: "" },
            { name: "", age: "" }
        ] as NotableOutcome[],
    });

    useEffect(() => {
        getTodayLog().then((log) => {
            if (log) {
                setFormData({
                    work_status: log.work_status || "출근",
                    call_target: log.call_target || 50,
                    call_actual: log.call_actual || 0,
                    missed_calls: log.missed_calls || 0,
                    performance_amount: log.performance_amount || 0,
                    performance_cases: log.performance_cases || 0,
                    notable_outcomes: log.notable_outcomes?.length > 0
                        ? log.notable_outcomes
                        : [{ name: "", age: "" }, { name: "", age: "" }, { name: "", age: "" }],
                });
                if (log.performance_amount > 0 || log.performance_cases > 0) {
                    setShowSales(true);
                }
            }
        });
    }, [getTodayLog]);

    const handleAddOutcome = () => {
        setFormData({
            ...formData,
            notable_outcomes: [...formData.notable_outcomes, { name: "", age: "" }],
        });
    };

    const handleUpdateOutcome = (index: number, field: string, value: string) => {
        const newOutcomes = [...formData.notable_outcomes];
        newOutcomes[index] = { ...newOutcomes[index], [field]: value };
        setFormData({ ...formData, notable_outcomes: newOutcomes });
    };

    const handleToggleField = (index: number, field: 'memo' | 'leader_request') => {
        const newOutcomes = [...formData.notable_outcomes];
        if (newOutcomes[index][field] === undefined) {
            newOutcomes[index][field] = "";
        } else {
            delete newOutcomes[index][field];
        }
        setFormData({ ...formData, notable_outcomes: newOutcomes });
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">오늘의 영업 기록</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Stats Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">근무 상태</label>
                            <select
                                className="glass-input w-full appearance-none h-12"
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
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">오늘의 콜 목표</label>
                            <input
                                type="number"
                                className="glass-input w-full h-12 text-lg font-outfit"
                                value={formData.call_target}
                                onChange={(e) => setFormData({ ...formData, call_target: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">실제 통화 수</label>
                            <input
                                type="number"
                                className="glass-input w-full h-12 text-lg font-bold font-outfit text-blue-400"
                                value={formData.call_actual}
                                onChange={(e) => setFormData({ ...formData, call_actual: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-orange-400 uppercase tracking-widest">부재 콜 수</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="glass-input w-full h-12 text-lg font-bold font-outfit text-orange-400 pl-10"
                                    value={formData.missed_calls}
                                    onChange={(e) => setFormData({ ...formData, missed_calls: parseInt(e.target.value) || 0 })}
                                />
                                <PhoneOff className="absolute left-3 top-3.5 w-4 h-4 text-orange-400/50" />
                            </div>
                        </div>
                    </div>

                    {/* Sales Performance Block */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-bold text-slate-300">상담 수 및 실적 기록</label>
                            <button
                                type="button"
                                onClick={() => setShowSales(!showSales)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${showSales ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                                {showSales ? '기록 접기' : '실적 기록 추가'}
                            </button>
                        </div>

                        {showSales && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-600/5 p-6 rounded-2xl border border-blue-500/20 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-300 tracking-wider">상담 수 (건수)</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full h-12 text-blue-400 font-bold"
                                        value={formData.performance_cases}
                                        onChange={(e) => setFormData({ ...formData, performance_cases: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-300 tracking-wider">계약 실적 (금액/원)</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full h-12 text-blue-400 font-bold"
                                        value={formData.performance_amount}
                                        onChange={(e) => setFormData({ ...formData, performance_amount: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notable Outcomes Block */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">주목할 만한 상담 내역</label>
                            <button
                                type="button"
                                onClick={handleAddOutcome}
                                className="text-xs font-bold flex items-center gap-1 text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded-lg transition-colors border border-blue-400/30"
                            >
                                <Plus className="w-4 h-4" /> 고객 추가
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.notable_outcomes.map((outcome, index) => (
                                <div key={index} className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 relative group hover:border-slate-700 transition-all">
                                    {/* Primary Info */}
                                    <div className="flex gap-4 items-center">
                                        <div className="flex-1 flex gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    placeholder="고객 이름"
                                                    className="glass-input w-full h-10 text-sm font-medium"
                                                    value={outcome.name}
                                                    onChange={(e) => handleUpdateOutcome(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="relative w-24">
                                                <input
                                                    placeholder="나이"
                                                    className="glass-input w-full h-10 text-sm font-medium"
                                                    value={outcome.age}
                                                    onChange={(e) => handleUpdateOutcome(index, 'age', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleField(index, 'memo')}
                                                className={`p-2 rounded-lg transition-colors ${outcome.memo !== undefined ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:bg-slate-800'}`}
                                                title="메모 추가"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleField(index, 'leader_request')}
                                                className={`p-2 rounded-lg transition-colors ${outcome.leader_request !== undefined ? 'bg-orange-600/20 text-orange-400' : 'text-slate-500 hover:bg-slate-800'}`}
                                                title="팀장 요청 추가"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOutcome(index)}
                                                className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dynamic Fields */}
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        {outcome.memo !== undefined && (
                                            <div className="relative">
                                                <textarea
                                                    placeholder="상담 메모를 입력하세요..."
                                                    className="glass-input w-full py-3 text-sm h-24 resize-none leading-relaxed"
                                                    value={outcome.memo}
                                                    onChange={(e) => handleUpdateOutcome(index, 'memo', e.target.value)}
                                                />
                                                <span className="absolute right-3 top-2 text-[10px] font-bold text-blue-400/50 uppercase tracking-tighter">Memo</span>
                                            </div>
                                        )}
                                        {outcome.leader_request !== undefined && (
                                            <div className="relative">
                                                <input
                                                    placeholder="팀장님께 요청할 사항 (예: 배정 요청, 동행 요청 등)"
                                                    className="glass-input w-full h-10 text-sm border-orange-500/30 bg-orange-500/5"
                                                    value={outcome.leader_request}
                                                    onChange={(e) => handleUpdateOutcome(index, 'leader_request', e.target.value)}
                                                />
                                                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-orange-400/50 uppercase tracking-tighter">Leader Request</span>
                                            </div>
                                        )}
                                    </div>

                                    {index >= 3 && (
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="pt-4 border-t border-slate-800 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] btn-primary py-4 px-6 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-slate-300 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>오늘 기록 저장하기</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
