"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const { user, signInWithGoogle, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push("/");
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas text-[var(--off-black)] p-4 relative overflow-hidden font-inter">
            {/* Background Decorative - Warm and Gentle */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--fin-orange)]/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg p-12 md:p-16 premium-card relative z-10 shadow-2xl border-[1px] border-[var(--oat-border)]"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-[var(--off-black)] rounded-[24px] mx-auto mb-8 flex items-center justify-center shadow-2xl rotate-6 hover:rotate-0 transition-all duration-500"
                    >
                        <span className="text-white font-bold text-4xl font-outfit">G</span>
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-[var(--fin-orange)]" />
                        <span className="text-xs font-bold text-[var(--fin-orange)] uppercase tracking-[0.3em] font-outfit">Premium Sales Tool</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 tracking-tight font-outfit text-[var(--off-black)]">GrowthManager</h1>
                    <p className="text-[var(--muted-sand)] text-lg font-medium leading-relaxed">성장하는 영업인을 위한<br />가장 따뜻하고 품격 있는 기록 공간</p>
                </div>

                <div className="space-y-8">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading || authLoading}
                        className="w-full flex items-center justify-between bg-[var(--off-black)] text-white py-5 px-8 rounded-[8px] font-outfit font-bold hover:bg-[#313130] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl group"
                    >
                        <div className="flex items-center gap-4">
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/20 border-t-white flex rounded-full animate-spin" />
                            ) : (
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="text-lg">Google 계정으로 시작하기</span>
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        <div className="w-full h-[1px] bg-[var(--oat-border)]/50" />
                        <p className="text-center text-xs text-[var(--muted-sand)] leading-loose max-w-[280px]">
                            계속 진행함으로써 성장관리자의 <a href="#" className="underline font-bold text-[var(--off-black)]">이용약관</a> 및 <a href="#" className="underline font-bold text-[var(--off-black)]">개인정보처리방침</a>에 동의하게 됩니다.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
