"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SupportLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user.role === 'support' || data.user.role === 'super_admin') {
          login(data.user);
          toast.success("Welcome back, Support Agent");
          router.push("/support-dashboard");
        } else {
          toast.error("Access Denied. Support privileges required.");
        }
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FF7A00] opacity-5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-[#FF7A00]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Support Portal</h1>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to reply to customer and seller chats</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@zayedexpress.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#FF7A00] rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white outline-none focus:ring-4 focus:ring-[#FF7A00]/10 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#FF7A00] rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white outline-none focus:ring-4 focus:ring-[#FF7A00]/10 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF7A00] hover:bg-[#FF9900] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/20 active:scale-[0.98] transition-all disabled:opacity-50 text-sm mt-2"
          >
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
