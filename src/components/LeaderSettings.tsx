import { useState, useEffect } from "react";
import { useTeam } from "@/hooks/useTeam";
import { useAuth } from "@/context/AuthContext";
import { X, Search, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { Connection } from "@/lib/types";

export function LeaderSettings({ onClose }: { onClose: () => void }) {
    const { requestLeader, removeLeader, fetchMyConnections, loading } = useTeam();
    const [email, setEmail] = useState("");
    const [myConnections, setMyConnections] = useState<Connection[]>([]);

    useEffect(() => {
        const unsubscribe = fetchMyConnections((list) => {
            setMyConnections(list);
        });
        return () => unsubscribe();
    }, [fetchMyConnections]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        await requestLeader(email);
        setEmail("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-outfit text-white">나의 팀장 설정</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">팀장 이메일 주소</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="leader@example.com"
                                className="glass-input flex-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary px-4"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">내가 등록한 팀장 목록</h3>
                    <div className="space-y-2">
                        {myConnections.length > 0 ? myConnections.map((conn) => (
                            <div key={conn.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${conn.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {conn.leaderEmail[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-200">{conn.leaderEmail}</span>
                                        {conn.status === 'accepted' ? (
                                            <span className="text-[10px] text-green-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> 승인 완료
                                            </span>
                                        ) : conn.status === 'rejected' ? (
                                            <span className="text-[10px] text-red-400 flex items-center gap-1">
                                                <X className="w-3 h-3" /> 거절됨
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-orange-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 승인 대기 중
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeLeader(conn.leaderEmail)}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-slate-500 text-sm italic">등록된 팀장이 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
