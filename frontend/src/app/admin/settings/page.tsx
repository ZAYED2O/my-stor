"use client";

import { Lock, User, Globe, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminSettings() {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  const handleUpdateProfile = () => {
    setLoadingProfile(true);
    setTimeout(() => {
      setLoadingProfile(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  const handleUpdatePassword = () => {
    setLoadingPass(true);
    setTimeout(() => {
      setLoadingPass(false);
      toast.success("Password changed successfully! Please login again.");
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings & Security</h2>
        <p className="text-muted-foreground mt-2">Manage your account settings and password.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Settings */}
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Profile Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Full Name</label>
              <input type="text" defaultValue="Admin User" className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Email Address</label>
              <input type="email" defaultValue="admin@enterprise.com" className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
            </div>
            <button 
              onClick={handleUpdateProfile}
              disabled={loadingProfile}
              className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition disabled:opacity-50"
            >
              {loadingProfile ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>

        {/* Security & Password */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 shadow-sm space-y-6 relative overflow-hidden">
          <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 text-primary/10" />
          <div className="flex items-center gap-3 border-b border-primary/10 pb-4 relative z-10">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Change Password</h3>
          </div>
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">New Password</label>
              <input type="password" placeholder="Enter new password" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
            </div>
            <button 
              onClick={handleUpdatePassword}
              disabled={loadingPass}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {loadingPass ? "Saving..." : "Save New Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
