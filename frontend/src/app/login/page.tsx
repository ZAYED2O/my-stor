"use client";

import Header from "../components/Header";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const login = useStore(state => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
       toast.error("Please fill in all fields.");
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
      
      if (!res.ok) {
         toast.error(data.error || "Login failed");
         setLoading(false);
         return;
      }

      login(data.user);
      localStorage.setItem('token', data.token);

      toast.success("Successfully logged in!");
      router.push("/profile");
    } catch (err) {
      toast.error("Could not connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
         <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00] opacity-10 blur-2xl rounded-full"></div>
            
            <div className="text-center mb-8 relative z-10">
               <div className="w-16 h-16 bg-[#1A233A] rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl mx-auto mb-4 shadow-lg shadow-[#1A233A]/20">
                  Z
               </div>
               <h1 className="text-2xl font-extrabold text-[#1A233A]">Welcome Back</h1>
               <p className="text-gray-500 mt-2 text-sm">Sign in to your ZAYED EXPRESS account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
               <div>
                  <label className="block text-sm font-bold text-[#1A233A] mb-2">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                     />
                  </div>
               </div>
               
               <div>
                  <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-[#1A233A]">Password</label>
                     <Link href="#" className="text-xs text-[#FF7A00] font-bold hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                     />
                  </div>
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#1A233A] hover:bg-[#2a3759] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6 disabled:opacity-50"
               >
                  {loading ? "Signing in..." : <>Sign In <ArrowRight className="w-5 h-5" /></>}
               </button>
            </form>

            <div className="mt-8 text-center relative z-10">
               <p className="text-sm text-gray-500">
                  Don't have an account? <Link href="/register" className="text-[#FF7A00] font-bold hover:underline">Sign up now</Link>
               </p>
            </div>
         </div>
      </main>
    </div>
  );
}
