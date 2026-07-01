"use client";

import Header from "../components/Header";
import { Package, ShieldAlert, Heart, MapPin, CreditCard, Headphones, UserCircle, CheckCircle2, ChevronLeft, LogOut, Clock, Truck, ShieldCheck, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CustomerProfile() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const router = useRouter();

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
       router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
     if (user) {
        fetch('/api/orders')
          .then(res => res.json())
          .then(data => {
             if (data.orders) {
                setOrders(data.orders.filter((o: any) => o.customerEmail === user.email));
             }
             setLoadingOrders(false);
          })
          .catch(() => setLoadingOrders(false));
     }
  }, [user]);

  // If not logged in, wait for redirect
  if (!user) {
     return null;
  }

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    router.push("/");
  };

  const cards = [
    { id: "orders", icon: Package, title: "Order History", desc: "Track, return, or buy things again" },
    { id: "settings", icon: ShieldAlert, title: "Account Settings", desc: "Edit login, name, and mobile number" },
    { id: "addresses", icon: MapPin, title: "Saved Addresses", desc: "Edit addresses for fast checkout" },
    { id: "payments", icon: CreditCard, title: "Payment Methods", desc: "Manage cards and billing" },
    { id: "wishlist", icon: Heart, title: "Wishlists", desc: "View your saved items" },
    { id: "support", icon: Headphones, title: "Customer Support", desc: "24/7 help from ZAYED EXPRESS" },
  ];

  if (user && user.role === 'super_admin') {
     cards.unshift({ id: "admin_portal", icon: ShieldCheck, title: "Admin Control Panel", desc: "Access the system settings and users list" });
  }
  if (user && (user.role === 'seller' || user.role === 'super_admin')) {
     cards.unshift({ id: "seller_portal", icon: Store, title: "Seller Dashboard", desc: "List products and check incoming orders" });
  }

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1A233A] mb-6">Order History & Tracking</h2>
            {loadingOrders ? (
               <p className="text-gray-500 text-center py-8">Loading your orders...</p>
            ) : orders.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">You have no orders yet.</p>
               </div>
            ) : (
               orders.map((order) => (
                 <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-4xl p-2 overflow-hidden flex-shrink-0">
                       {order.items[0]?.image.startsWith('data:') ? <img src={order.items[0]?.image} className="w-full h-full object-contain mix-blend-multiply" /> : order.items[0]?.image || '📦'}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="font-bold text-[#1A233A] text-lg line-clamp-1">{order.items[0]?.name} {order.items.length > 1 && `+ ${order.items.length - 1} more items`}</p>
                             <p className="text-sm text-gray-500 mt-1">Order {order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="font-bold text-[#1A233A] text-xl">${order.total.toFixed(2)}</p>
                       </div>
                       <div className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit text-sm font-bold ${
                           order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                           order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                           order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                           'bg-emerald-100 text-emerald-700'
                       }`}>
                          {order.status === 'Pending' && <Clock className="w-4 h-4" />}
                          {order.status === 'Processing' && <Package className="w-4 h-4" />}
                          {order.status === 'Shipped' && <Truck className="w-4 h-4" />}
                          {order.status === 'Delivered' && <CheckCircle2 className="w-4 h-4" />}
                          Status: {order.status}
                       </div>
                    </div>
                 </div>
               ))
            )}
          </motion.div>
        );
      case "addresses":
        return (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-[#1A233A]">Saved Addresses</h2>
               <button className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">Add New</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border-2 border-[#FF7A00] p-6 relative">
               <span className="absolute top-4 right-4 bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Default</span>
               <h3 className="font-bold text-[#1A233A] mb-3 text-lg">Home Address</h3>
               <p className="text-gray-600 leading-relaxed">
                 John Doe<br/>
                 123 Commerce Blvd, Suite 400<br/>
                 New York, NY 10001<br/>
                 United States
               </p>
               <div className="mt-6 flex gap-4">
                  <button className="text-[#FF7A00] font-bold text-sm hover:underline">Edit</button>
                  <button className="text-red-500 font-bold text-sm hover:underline">Remove</button>
               </div>
            </div>
          </motion.div>
        );
      case "payments":
        return (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-[#1A233A]">Payment Methods</h2>
               <button className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">Add Card</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
               <div className="w-16 h-12 bg-gradient-to-br from-[#1A233A] to-[#2a3759] rounded-lg flex items-center justify-center text-white text-xs font-bold italic shadow-inner">VISA</div>
               <div className="flex-1">
                  <p className="font-bold text-[#1A233A] text-lg">Visa ending in 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/2028</p>
               </div>
               <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Default</span>
            </div>
          </motion.div>
        );
      case "wishlist":
      case "settings":
      case "support":
         return (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                 <Package className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A233A] mb-2">Coming Soon</h2>
              <p className="text-gray-500">This section is currently under construction.</p>
           </motion.div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
         
         {/* Profile Banner */}
         <div className="bg-[#1A233A] rounded-3xl p-8 mb-8 flex items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00] opacity-10 blur-3xl rounded-full"></div>
            <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white relative z-10 border border-white/20">
               <UserCircle className="w-12 h-12" />
            </div>
            <div className="relative z-10 flex-1">
               <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
               <p className="text-gray-400 mt-1">{user.email}</p>
               <span className="inline-block mt-3 px-3 py-1 bg-[#FF7A00] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
                  Zayed VIP
               </span>
            </div>
            
            <button 
               onClick={handleLogout}
               className="relative z-10 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/20 hover:border-red-500/50 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
               <LogOut className="w-5 h-5" />
               <span className="hidden sm:inline">Sign Out</span>
            </button>
         </div>
         
         <AnimatePresence mode="wait">
           {!activeTab ? (
             <motion.div 
               key="grid"
               initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
               className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
             >
                {cards.map((card) => (
                   <div 
                      key={card.id} 
                      onClick={() => {
                          if (card.id === 'admin_portal') {
                             router.push('/admin');
                          } else if (card.id === 'seller_portal') {
                             router.push('/seller');
                          } else {
                             setActiveTab(card.id);
                          }
                       }}
                      className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex gap-4 hover:shadow-xl hover:border-[#FF7A00]/30 transition-all cursor-pointer group"
                   >
                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF7A00]/10 transition-colors">
                         <card.icon className="w-6 h-6 text-gray-400 group-hover:text-[#FF7A00] transition-colors" />
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-[#1A233A]">{card.title}</h3>
                         <p className="text-sm text-gray-500 leading-relaxed mt-1">{card.desc}</p>
                      </div>
                   </div>
                ))}
             </motion.div>
           ) : (
             <motion.div key="content" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <button 
                   onClick={() => setActiveTab(null)}
                   className="flex items-center gap-2 text-gray-500 hover:text-[#FF7A00] font-bold mb-6 transition-colors"
                >
                   <ChevronLeft className="w-5 h-5" /> Back to Account
                </button>
                {renderContent()}
             </motion.div>
           )}
         </AnimatePresence>
      </main>
    </div>
  );
}
