"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn } from "lucide-react";

export function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="glass-card w-full max-w-md p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold font-outfit text-white">GrowthManager</h1>
                    <p className="mt-2 text-slate-400">당신의 성장을 기록하고 관리하세요</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">이메일</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="glass-input w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">비밀번호</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="glass-input w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? "로그인 중..." : (
                            <>
                                <LogIn className="w-5 h-5" />
                                로그인
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center text-sm text-slate-500">
                    <p>엉클비 스튜디오 통합 계정으로 로그인하세요</p>
                </div>
            </div>
        </div>
    );
}
