"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { TrendingUp, Package, ShoppingBag, ArrowRight, PlusCircle, CheckCircle2, Clock, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SellerDashboard() {
  const products = useStore((state) => state.products);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchOrders();
  }, []);

  const fetchOrders = async () => {
     try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (res.ok) setOrders(data.orders);
     } catch (err) {
        toast.error("Failed to load orders");
     } finally {
        setLoading(false);
     }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
     try {
        const res = await fetch('/api/orders', {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ orderId, newStatus })
        });
        if (res.ok) {
           toast.success(`Order status updated to ${newStatus}`);
           fetchOrders();
        } else {
           toast.error("Failed to update status");
        }
     } catch (err) {
        toast.error("An error occurred");
     }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Active Listings", value: products.length.toString(), icon: Package, color: "text-[#FF7A00]", bg: "bg-[#FF7A00]/10" },
    { title: "Pending Orders", value: pendingOrders.toString(), icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        <div>
           <h1 className="text-3xl font-extrabold text-[#1A233A]">Seller Dashboard</h1>
           <p className="text-gray-500 mt-1">Manage your store's inventory and performance.</p>
        </div>

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

      {/* Orders Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-2">
               <ShoppingBag className="w-5 h-5 text-[#FF7A00]" /> Recent Orders
            </h2>
            <button onClick={fetchOrders} className="text-sm font-bold text-[#FF7A00] hover:underline">Refresh</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                     <th className="p-4 font-bold uppercase tracking-wider">Order ID</th>
                     <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
                     <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                     <th className="p-4 font-bold uppercase tracking-wider">Total</th>
                     <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                     <th className="p-4 font-bold uppercase tracking-wider">Action</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                     <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                     <tr><td colSpan={6} className="p-8 text-center text-gray-400">No orders received yet.</td></tr>
                  ) : (
                     orders.map((order: any, idx) => (
                        <motion.tr initial={{opacity:0}} animate={{opacity:1}} transition={{delay: idx*0.05}} key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                           <td className="p-4 font-bold text-[#1A233A]">{order.id}</td>
                           <td className="p-4">
                              <p className="font-bold text-[#1A233A]">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail}</p>
                           </td>
                           <td className="p-4 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                           <td className="p-4 font-bold text-[#FF7A00]">${order.total.toFixed(2)}</td>
                           <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${
                                 order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                 order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                 order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                 'bg-emerald-100 text-emerald-700'
                              }`}>
                                 {order.status === 'Pending' && <Clock className="w-3 h-3" />}
                                 {order.status === 'Processing' && <Package className="w-3 h-3" />}
                                 {order.status === 'Shipped' && <Truck className="w-3 h-3" />}
                                 {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                                 {order.status}
                              </span>
                           </td>
                           <td className="p-4">
                              <select 
                                 value={order.status}
                                 onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                 className="bg-white border border-gray-200 text-sm font-bold text-[#1A233A] rounded-lg px-3 py-1.5 outline-none focus:border-[#FF7A00] transition-colors cursor-pointer"
                              >
                                 <option value="Pending">Pending</option>
                                 <option value="Processing">Processing</option>
                                 <option value="Shipped">Shipped</option>
                                 <option value="Delivered">Delivered</option>
                              </select>
                           </td>
                        </motion.tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         {/* Quick Actions */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-[#1A233A] mb-6">Quick Actions</h2>
            <div className="space-y-4">
               <Link href="/seller/products/add" className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#FF7A00]/10 transition-colors">
                        <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-[#FF7A00]" />
                     </div>
                     <div>
                        <h3 className="font-bold text-[#1A233A]">Add New Product</h3>
                        <p className="text-sm text-gray-500">List a new item in your catalog</p>
                     </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#FF7A00] transition-colors" />
               </Link>
               
               <Link href="/seller/products" className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#FF7A00]/10 transition-colors">
                        <Package className="w-6 h-6 text-gray-400 group-hover:text-[#FF7A00]" />
                     </div>
                     <div>
                        <h3 className="font-bold text-[#1A233A]">Manage Inventory</h3>
                        <p className="text-sm text-gray-500">Update pricing and stock levels</p>
                     </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#FF7A00] transition-colors" />
               </Link>
            </div>
         </div>

         {/* Recent Products Preview */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-[#1A233A]">Recent Listings</h2>
               <Link href="/seller/products" className="text-[#FF7A00] font-bold text-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
               {products.slice(0, 3).map(product => {
                  const isUrl = product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('/');
                  return (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                     <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden p-1">
                        {isUrl ? <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" /> : product.image}
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-[#1A233A] text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                     </div>
                     <span className="font-bold text-[#1A233A]">${product.price.toFixed(2)}</span>
                  </div>
               );
              })}
         </div>
      </div>
      </div>
      </main>
    </div>
  );
}
