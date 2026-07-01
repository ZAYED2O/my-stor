"use client";

import { useEffect, useState } from "react";
import { Package, TrendingUp, Users, ShoppingBag, Clock, CheckCircle2, Headphones, HelpCircle, MessageSquare, Send, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "tickets">("orders");

  // Admin reply states
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReply, setTicketReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchTickets();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      }
    } catch (error) {
      toast.error("Failed to load support tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
     try {
        const res = await fetch("/api/orders", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ orderId, newStatus })
        });
        if (res.ok) {
           toast.success(`Order ${orderId} status set to ${newStatus}`);
           fetchOrders();
        } else {
           toast.error("Failed to update order status");
        }
     } catch (err) {
        toast.error("Connection error");
     }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedTicket || !ticketReply.trim()) return;
     setSubmittingReply(true);
     try {
        const res = await fetch("/api/support", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              ticketId: selectedTicket.id,
              reply: ticketReply,
              status: "Replied"
           })
        });
        if (res.ok) {
           toast.success("Reply submitted successfully!");
           setTicketReply("");
           setSelectedTicket(null);
           fetchTickets();
        } else {
           toast.error("Failed to submit reply");
        }
     } catch (err) {
        toast.error("Connection error");
     } finally {
        setSubmittingReply(false);
     }
  };

  const totalRevenue = orders
    .filter((o: any) => o.status !== "Cancelled")
    .reduce((sum: number, order: any) => sum + order.total, 0);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Total Orders", value: orders.length.toString(), icon: ShoppingBag, color: "text-[#FF7A00]", bg: "bg-[#FF7A00]/10" },
    { title: "Open Tickets", value: tickets.filter(t => t.status === "Open").length.toString(), icon: Headphones, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 md:px-8 py-8 space-y-8">
         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-[#1A233A]">Admin Control Panel</h1>
               <p className="text-gray-500 mt-1">Manage orders, update dispatch status, and reply to client inquiries.</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => { fetchOrders(); fetchTickets(); }} className="bg-white border border-gray-200 text-[#1A233A] font-bold px-4 py-2.5 rounded-xl shadow-sm hover:border-[#FF7A00] transition-colors text-sm">
                  Refresh Data
               </button>
            </div>
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

         {/* Navigation Tabs */}
         <div className="flex border-b border-gray-200">
            <button 
               onClick={() => setActiveTab("orders")}
               className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === "orders" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-gray-400 hover:text-[#1A233A]"}`}
            >
               Order Management ({orders.length})
            </button>
            <button 
               onClick={() => setActiveTab("tickets")}
               className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === "tickets" ? "border-[#FF7A00] text-[#FF7A00]" : "border-transparent text-gray-400 hover:text-[#1A233A]"}`}
            >
               Support Tickets ({tickets.filter(t => t.status === "Open").length} Open)
            </button>
         </div>

         {/* Content based on tab */}
         {activeTab === "orders" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-2">
                     <Package className="w-5 h-5 text-[#FF7A00]" /> Recent Orders
                  </h2>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                           <th className="p-4 font-bold uppercase tracking-wider">Order ID</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Items</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Total</th>
                           <th className="p-4 font-bold uppercase tracking-wider text-right">Status Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {loadingOrders ? (
                           <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading orders...</td></tr>
                        ) : orders.length === 0 ? (
                           <tr><td colSpan={6} className="p-8 text-center text-gray-400">No orders placed yet.</td></tr>
                        ) : (
                           orders.map((order: any, idx) => (
                              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                                 <td className="p-4 font-bold text-[#1A233A]">{order.id}</td>
                                 <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                 <td className="p-4 text-[#1A233A] font-medium">{order.customerName}<br/><span className="text-xs text-gray-400">{order.customerEmail}</span></td>
                                 <td className="p-4 text-gray-500">{order.items?.length || 0} items</td>
                                 <td className="p-4 font-extrabold text-[#1A233A]">${order.total.toFixed(2)}</td>
                                 <td className="p-4 text-right">
                                    <select 
                                       value={order.status} 
                                       onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                       className={`text-xs font-bold rounded-lg px-3 py-1.5 outline-none border focus:ring-1 focus:ring-[#FF7A00] ${
                                          order.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                          order.status === 'Processing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                          order.status === 'Shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                          order.status === 'Cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                                          'bg-emerald-50 border-emerald-200 text-emerald-700'
                                       }`}
                                    >
                                       <option value="Pending">Pending</option>
                                       <option value="Processing">Processing</option>
                                       <option value="Shipped">Shipped</option>
                                       <option value="Delivered">Delivered</option>
                                       <option value="Cancelled">Cancelled</option>
                                    </select>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-xl font-bold text-[#1A233A] flex items-center gap-2">
                     <Headphones className="w-5 h-5 text-[#FF7A00]" /> Customer Support Tickets
                  </h2>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                           <th className="p-4 font-bold uppercase tracking-wider">Ticket ID</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Client Email</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Subject</th>
                           <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                           <th className="p-4 font-bold uppercase tracking-wider text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {loadingTickets ? (
                           <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading tickets...</td></tr>
                        ) : tickets.length === 0 ? (
                           <tr><td colSpan={6} className="p-8 text-center text-gray-400">No support tickets found.</td></tr>
                        ) : (
                           tickets.map((ticket: any) => (
                              <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                                 <td className="p-4 font-bold text-[#1A233A]">{ticket.id}</td>
                                 <td className="p-4 text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                 <td className="p-4 text-[#1A233A] font-medium">{ticket.customerEmail}</td>
                                 <td className="p-4 font-medium text-[#1A233A]">
                                    {ticket.subject}
                                    <p className="text-xs text-gray-400 font-normal mt-1 max-w-sm truncate">{ticket.message}</p>
                                 </td>
                                 <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                       ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                                       ticket.status === 'Replied' ? 'bg-blue-100 text-blue-700' :
                                       'bg-emerald-100 text-emerald-700'
                                    }`}>
                                       {ticket.status}
                                    </span>
                                 </td>
                                 <td className="p-4 text-right">
                                    <button 
                                       onClick={() => setSelectedTicket(ticket)}
                                       className="bg-[#1A233A] hover:bg-[#FF7A00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                       {ticket.reply ? "View & Edit Reply" : "Reply Ticket"}
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </main>

      {/* Reply Modal */}
      <AnimatePresence>
         {selectedTicket && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
               <motion.div 
                 initial={{opacity: 0, scale: 0.95}}
                 animate={{opacity: 1, scale: 1}}
                 exit={{opacity: 0, scale: 0.95}}
                 className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative"
               >
                  <button onClick={() => setSelectedTicket(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                     <X className="w-6 h-6" />
                  </button>
                  <div>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Support Response</span>
                     <h3 className="text-xl font-bold text-[#1A233A] mt-1">Reply to Ticket {selectedTicket.id}</h3>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                     <p className="text-gray-400 font-bold">Client Email: <span className="text-[#1A233A]">{selectedTicket.customerEmail}</span></p>
                     <p className="text-gray-400 font-bold">Subject: <span className="text-[#1A233A]">{selectedTicket.subject}</span></p>
                     <div className="h-px bg-gray-200 my-2" />
                     <p className="text-gray-600 leading-relaxed font-medium bg-white p-3 rounded-xl border border-gray-100">{selectedTicket.message}</p>
                  </div>

                  <form onSubmit={handleReplyTicket} className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500">Your Response Message</label>
                        <textarea 
                           required 
                           value={ticketReply} 
                           onChange={e => setTicketReply(e.target.value)} 
                           placeholder="Type the response details..." 
                           rows={5} 
                           className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-sm"
                        />
                     </div>
                     <div className="flex gap-4">
                        <button type="submit" disabled={submittingReply} className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50">
                           {submittingReply ? "Sending Response..." : "Send Response"}
                        </button>
                        <button type="button" onClick={() => setSelectedTicket(null)} className="text-gray-500 font-bold hover:underline text-sm">Cancel</button>
                     </div>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
