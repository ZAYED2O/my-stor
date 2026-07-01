"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Lock, ShieldCheck, LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdminAuth = useStore(state => state.isAdminAuth);
  const adminLogin = useStore(state => state.adminLogin);
  const user = useStore(state => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  useEffect(() => setIsMounted(true), []);

  // Auto-authenticate if user is already logged in with super_admin role
  useEffect(() => {
    if (isMounted && !isAdminAuth && user && (user as any).role === 'super_admin') {
      adminLogin();
    }
  }, [isMounted, isAdminAuth, user, adminLogin]);

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!email || !password) return toast.error("Enter email and password");
     
     try {
        const res = await fetch("/api/auth/login", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
           if (data.user.role === 'super_admin') {
              adminLogin();
              useStore.getState().login(data.user);
              toast.success("Welcome, Administrator");
           } else {
              toast.error("Access Denied. You do not have administrator privileges.");
           }
        } else {
           toast.error(data.error || "Login failed");
        }
     } catch (err) {
        toast.error("An error occurred");
     }
  };

  if (!isMounted) return null;

  if (!isAdminAuth) {
     return (
        <div className="min-h-screen bg-[#1A233A] flex items-center justify-center p-4">
           <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center">
              <div className="w-20 h-20 mb-4 flex items-center justify-center">
                 <img src="/logo.png" alt="ZAYED EXPRESS" className="max-w-full max-h-full object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A233A] mb-2">Admin Portal</h1>
              <p className="text-gray-500 text-sm mb-8 text-center">Restricted Access. Please login with your administrator account.</p>
              
              <div className="w-full relative mb-4">
                 <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin Email Address" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                 />
              </div>

              <div className="w-full relative mb-6">
                 <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                 <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                 />
              </div>
              
              <button type="submit" className="w-full bg-[#1A233A] text-white font-bold py-3 rounded-xl hover:bg-[#2a3759] transition-colors">
                 Access Portal
              </button>
           </form>
        </div>
     );
  }

  return (
     <div className="min-h-screen bg-[#F9FAFB] flex">
        {/* Light Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
           <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              <span className="font-extrabold text-[#1A233A] tracking-tight ml-2">ZAYED <span className="text-[#FF7A00]">ADMIN</span></span>
           </div>
           
           <nav className="p-4 space-y-2 flex-1">
              {navLinks.map(link => {
                 const isActive = pathname === link.href;
                 return (
                    <Link 
                       key={link.href} 
                       href={link.href}
                       className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'text-gray-500 hover:text-[#1A233A] hover:bg-gray-50'}`}
                    >
                       <link.icon className="w-5 h-5" />
                       {link.name}
                    </Link>
                 )
              })}
              <div className="pt-4 mt-4 border-t border-gray-100">
                 <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-[#1A233A] hover:bg-gray-50 transition-all">
                    <LayoutDashboard className="w-5 h-5" /> Back to Store
                 </Link>
              </div>
           </nav>
           
           <div className="p-4 border-t border-gray-100">
              <button onClick={() => useStore.getState().adminLogout()} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                 <LogOut className="w-5 h-5" /> Secure Logout
              </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
           {children}
        </div>
     </div>
  );
}
