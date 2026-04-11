"use client";

import { useAuth } from "@/context/AuthContext";
import { Login } from "@/components/Login";
import { Dashboard } from "@/components/Dashboard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {user ? <Dashboard /> : <Login />}
    </main>
  );
}
