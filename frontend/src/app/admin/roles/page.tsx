"use client";

import { Shield, Plus, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminRoles() {
  const roles = [
    { name: "Super Admin", description: "Full access to all system features and settings.", users: 2 },
    { name: "Store Manager", description: "Can manage products, orders, and view basic analytics.", users: 5 },
    { name: "Support Agent", description: "Access to customer messages and order tracking only.", users: 12 },
  ];

  const permissionsList = ["Manage Products", "Manage Orders", "Manage Users", "View Analytics", "System Settings"];

  const [activeRole, setActiveRole] = useState(0);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    permissionsList.reduce((acc, perm) => ({ ...acc, [perm]: true }), {})
  );

  const handleToggle = (perm: string, value: boolean) => {
    setPermissions(prev => ({ ...prev, [perm]: value }));
  };

  const handleSave = () => {
    toast.success(`Permissions saved successfully for ${roles[activeRole].name}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground mt-2">Define access levels (RBAC) for your admin team.</p>
        </div>
        <button 
          onClick={() => toast.info("Create Role modal opened (Coming soon)")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          Create Role
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Role Cards */}
        <div className="lg:col-span-1 space-y-4">
          {roles.map((role, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveRole(idx)}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${activeRole === idx ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border hover:border-primary/50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${activeRole === idx ? 'text-primary' : 'text-muted-foreground'}`} />
                  {role.name}
                </h3>
                <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">{role.users} Users</span>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border shadow-sm">
          <h3 className="font-bold text-xl mb-6">Edit Permissions: {roles[activeRole].name}</h3>
          <div className="space-y-4">
             {permissionsList.map((perm, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                  <span className="font-medium">{perm}</span>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleToggle(perm, true)}
                       className={`w-8 h-8 rounded flex items-center justify-center transition ${permissions[perm] ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                     >
                       <Check className="w-5 h-5" />
                     </button>
                     <button 
                       onClick={() => handleToggle(perm, false)}
                       className={`w-8 h-8 rounded flex items-center justify-center border transition ${!permissions[perm] ? 'bg-destructive border-destructive text-white' : 'border-border text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive'}`}
                     >
                       <X className="w-5 h-5" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
          <div className="mt-8 flex justify-end">
             <button 
               onClick={handleSave}
               className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
             >
                Save Permissions
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
