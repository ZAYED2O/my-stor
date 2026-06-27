"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, Users, ShoppingBag, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Total Orders", value: orders.length.toString(), icon: ShoppingBag, color: "text-[#FF7A00]", bg: "bg-[#FF7A00]/10" },
    { title: "Active Customers", value: new Set(orders.map((o:any)=>o.customerName)).size.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 md:px-8 py-8 space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-extrabold text-[#1A233A]">Admin Control Panel</h1>
               <p className="text-gray-500 mt-1">Manage your store's orders and real-time performance.</p>
            </div>
            <button onClick={fetchOrders} className="bg-white border border-gray-200 text-[#1A233A] font-bold px-4 py-2 rounded-xl shadow-sm hover:border-[#FF7A00] transition-colors">
               Refresh Data
            </button>
         </div>

         {/* Stats Grid */}
         <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
               <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: idx*0.1}} key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                     <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                     <p className="text-3xl font-extrabold text-[#1A233A] mt-1">{stat.value}</p>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Orders Table */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#FF7A00]" /> Recent Orders
               </h2>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <th className="p-4 font-bold uppercase tracking-wider">Order ID</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Items</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Total</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading orders...</td></tr>
                     ) : orders.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">No orders placed yet.</td></tr>
                     ) : (
                        orders.map((order: any, idx) => (
                           <motion.tr initial={{opacity:0}} animate={{opacity:1}} transition={{delay: idx*0.05}} key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 font-bold text-[#1A233A]">{order.id}</td>
                              <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-[#1A233A] font-medium">{order.customerName}</td>
                              <td className="p-4 text-gray-500">{order.items?.length || 0} items</td>
                              <td className="p-4 font-extrabold text-[#1A233A]">${order.total.toFixed(2)}</td>
                              <td className="p-4">
                                 <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                    <Clock className="w-3 h-3" /> {order.status}
                                 </span>
                              </td>
                           </motion.tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </main>
    </div>
  );
}
