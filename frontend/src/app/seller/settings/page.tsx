"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock, UserCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function SellerSettings() {
  const user = useStore(state => state.user);
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
       return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
       return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
       const res = await fetch('/api/auth/password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             email: user?.email,
             oldPassword,
             newPassword
          })
       });
       
       const data = await res.json();
       
       if (res.ok) {
          toast.success("Password updated successfully!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
       } else {
          toast.error(data.error || "Failed to update password");
       }
    } catch (err) {
       toast.error("An error occurred");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 w-full pt-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1A233A]">Account Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your seller account security.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
         <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <UserCircle className="w-12 h-12" />
         </div>
         <div>
            <h3 className="text-xl font-bold text-[#1A233A]">{user?.name}</h3>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active Seller</span>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <Lock className="w-5 h-5 text-[#FF7A00]" />
            <h3 className="text-lg font-bold text-[#1A233A]">Change Password</h3>
         </div>
         
         <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
               <input 
                  type="password" 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                  required
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
               <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                  required
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
               <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all"
                  required
               />
            </div>
            
            <button 
               type="submit" 
               disabled={loading}
               className="mt-6 bg-[#1A233A] hover:bg-[#2a3759] text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
               {loading ? "Updating..." : "Update Password"}
            </button>
         </form>
      </div>
    </div>
  );
}
