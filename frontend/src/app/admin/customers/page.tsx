"use client";

import { useEffect, useState } from "react";
import { Users, ShieldAlert, Store } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CustomersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
     try {
        const res = await fetch("/api/users", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ userId, newRole })
        });
        
        if (res.ok) {
           toast.success(`User role updated to ${newRole}`);
           fetchUsers(); // Refresh the list
        } else {
           toast.error("Failed to update role");
        }
     } catch (err) {
        toast.error("An error occurred");
     }
  };

  return (
    <div className="space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-extrabold text-[#1A233A]">Users & Permissions</h1>
               <p className="text-gray-500 mt-1">Manage accounts, assign sellers, and promote administrators.</p>
            </div>
            <button onClick={fetchUsers} className="bg-white border border-gray-200 text-[#1A233A] font-bold px-4 py-2 rounded-xl shadow-sm hover:border-[#FF7A00] transition-colors">
               Refresh Data
            </button>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF7A00]" /> Registered Users
               </h2>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <th className="p-4 font-bold uppercase tracking-wider">Name</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Email</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Joined Date</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Current Role</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading users...</td></tr>
                     ) : users.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">No users found.</td></tr>
                     ) : (
                        users.map((user: any, idx) => (
                           <motion.tr initial={{opacity:0}} animate={{opacity:1}} transition={{delay: idx*0.05}} key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-bold text-[#1A233A]">{user.name}</td>
                              <td className="p-4 text-gray-500">{user.email}</td>
                              <td className="p-4 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                 <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${
                                    user.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                                    user.role === 'seller' ? 'bg-[#FF7A00]/10 text-[#FF7A00]' :
                                    user.role === 'support' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                 }`}>
                                    {user.role === 'super_admin' && <ShieldAlert className="w-3 h-3" />}
                                    {user.role === 'seller' && <Store className="w-3 h-3" />}
                                    {user.role === 'support' && <Users className="w-3 h-3" />}
                                    {user.role.replace('_', ' ').toUpperCase()}
                                 </span>
                              </td>
                              <td className="p-4">
                                 <select 
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="bg-white border border-gray-200 text-sm font-bold text-[#1A233A] rounded-lg px-3 py-1.5 outline-none focus:border-[#FF7A00] transition-colors cursor-pointer"
                                 >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="support">Support Agent</option>
                                    <option value="super_admin">Super Admin</option>
                                 </select>
                              </td>
                           </motion.tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
    </div>
  );
}
