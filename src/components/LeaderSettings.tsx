"use client";

import { useState, useEffect } from "react";
import { useTeam } from "@/hooks/useTeam";
import { useAuth } from "@/context/AuthContext";
import { X, Search, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { Connection } from "@/lib/types";

export function LeaderSettings({ onClose }: { onClose: () => void }) {
    const { user } = useAuth();
    const { requestLeader, removeLeader, fetchMyConnections, loading } = useTeam();
    const [email, setEmail] = useState("");
    const [myConnections, setMyConnections] = useState<Connection[]>([]);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = fetchMyConnections((list) => {
            setMyConnections(list);
        });
        return () => unsubscribe();
    }, [user, fetchMyConnections]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        await requestLeader(email);
        setEmail("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-300">
            <div className="premium-card w-full max-w-md p-8 md:p-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                <div className="flex justify-between items-center border-b border-[var(--oat-border)] pb-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-outfit text-[var(--off-black)]">팀장 연결 관리</h2>
                        <p className="text-xs text-[var(--muted-sand)] font-medium">활동을 공유할 팀장님을 등록하세요.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--canvas)] rounded-full transition-all text-[var(--muted-sand)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-wider px-1">팀장 이메일 주소</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="leader@example.com"
                                className="premium-input flex-1 h-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--off-black)] text-white px-5 rounded-[4px] hover:bg-[#313130] transition-all disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-[var(--muted-sand)] uppercase tracking-widest px-1">연결 목록</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {myConnections.length > 0 ? myConnections.map((conn) => (
                            <div key={conn.id} className="flex items-center justify-between p-4 bg-[var(--canvas)] rounded-[8px] border border-[var(--oat-border)] hover:border-[var(--fin-orange)]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${conn.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-white text-[var(--muted-sand)] border border-[var(--oat-border)]'}`}>
                                        {conn.leaderEmail[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[var(--off-black)]">{conn.leaderEmail}</span>
                                        {conn.status === 'accepted' ? (
                                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                <CheckCircle2 className="w-3 h-3" /> Connected
                                            </span>
                                        ) : conn.status === 'rejected' ? (
                                            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                <X className="w-3 h-3" /> Rejected
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeLeader(conn.leaderEmail)}
                                    className="p-2 text-[var(--muted-sand)] hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-[var(--canvas)]/50 rounded-[8px] border border-dashed border-[var(--oat-border)]">
                                <p className="text-[var(--muted-sand)] text-sm italic">등록된 팀장이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
