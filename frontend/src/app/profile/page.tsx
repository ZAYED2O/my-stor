"use client";

import Header from "../components/Header";
import { Package, Heart, MapPin, CreditCard, Headphones, UserCircle, CheckCircle2, ChevronLeft, LogOut, Clock, Truck, Send, MessageSquare, X, Mic, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const login = useStore(state => state.login);
  const wishlist = useStore(state => state.wishlist || []);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const addToCart = useStore(state => state.addToCart);

  // Address states
  const addresses = useStore(state => state.addresses || []);
  const addAddress = useStore(state => state.addAddress);
  const removeAddress = useStore(state => state.removeAddress);
  const updateAddress = useStore(state => state.updateAddress);

  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressTitle, setAddressTitle] = useState("");
  const [addressFullName, setAddressFullName] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressZip, setAddressZip] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [addressDefault, setAddressDefault] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Profile settings states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Support states
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        if (file.size > 1 * 1024 * 1024) {
           toast.error("Image size must be less than 1MB");
           return;
        }
        const reader = new FileReader();
        reader.onload = () => {
           setProfileAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
     }
  };
  
  // Live Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
     { sender: 'bot', text: 'مرحباً بك في Zayed Express. كيف يمكنني مساعدتك اليوم؟', time: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
       router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
     if (user) {
        setProfileName(user.name);
        setProfileAvatar(user.avatar || "");
        fetchOrders();
     }
  }, [user]);

  useEffect(() => {
     if (activeTab === 'support') {
        fetchTickets();
     }
  }, [activeTab]);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  const fetchOrders = () => {
    if (!user) return;
    setLoadingOrders(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
         if (data.orders) {
            setOrders(data.orders.filter((o: any) => o.customerEmail === user.email));
         }
         setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  };

  const fetchTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/support?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (res.ok && data.tickets) {
         setTickets(data.tickets);
      }
    } catch (err) {
       console.error('Failed to load tickets:', err);
    } finally {
       setLoadingTickets(false);
    }
  };

  if (!user) {
     return null;
  }

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: profileName,
          avatar: profileAvatar || undefined,
          oldPassword: oldPassword || undefined,
          newPassword: newPassword || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        toast.success("Profile updated successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
     if (!confirm("Are you sure you want to cancel this order?")) return;
     try {
        const res = await fetch("/api/orders", {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              orderId,
              newStatus: "Cancelled"
           })
        });
        if (res.ok) {
           toast.success("Order cancelled successfully");
           fetchOrders();
        } else {
           toast.error("Failed to cancel order");
        }
     } catch (err) {
        toast.error("Connection error");
     }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingAddress ? editingAddress.id : 'addr-' + Date.now(),
      title: addressTitle,
      fullName: addressFullName,
      street: addressStreet,
      city: addressCity,
      zip: addressZip,
      country: addressCountry,
      isDefault: addressDefault
    };

    if (editingAddress) {
      updateAddress(payload);
      toast.success("Address updated successfully!");
    } else {
      addAddress(payload);
      toast.success("Address added successfully!");
    }
    setShowAddressForm(false);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const res = await fetch("/api/support", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            customerEmail: user.email,
            subject: ticketSubject,
            message: ticketMessage
         })
       });
       const data = await res.json();
       if (res.ok) {
          toast.success(`Support ticket submitted! ID: ${data.ticket.id}`);
          setTicketSubject("");
          setTicketMessage("");
          setShowTicketForm(false);
          fetchTickets();
       } else {
          toast.error(data.error || "Failed to submit ticket");
       }
     } catch (err) {
        toast.error("Connection failed");
     }
  };

   // Real-time Chat States
   const [activeChannel, setActiveChannel] = useState<any | null>(null);
   const [isRecording, setIsRecording] = useState(false);
   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
   const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
   const [recordingDuration, setRecordingDuration] = useState(0);
   const durationInterval = useRef<any>(null);
   const pollInterval = useRef<any>(null);

   const startChat = async () => {
      setChatOpen(true);
      try {
         const res = await fetch("/api/chat/channels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               type: "customer_support",
               creator_id: user.name || user.email,
               subject: "Customer Live Chat inquiry"
            })
         });
         const data = await res.json();
         if (res.ok && data.channel) {
            setActiveChannel(data.channel);
            fetchChatMessages(data.channel.id);
         }
      } catch (err) {
         console.error("Failed to start chat channel");
      }
   };

   const fetchChatMessages = async (channelId: string) => {
      try {
         const res = await fetch(`/api/chat/messages?channelId=${channelId}`);
         const data = await res.json();
         if (res.ok) {
            setChatMessages(data.messages || []);
         }
      } catch (err) {
         console.error("Failed to fetch messages");
      }
   };

   const handleSendChatMessage = async (e?: React.FormEvent, audioBase64?: string) => {
      if (e) e.preventDefault();
      if (!chatInput.trim() && !audioBase64) return;
      if (!user) return;

      let channelId = activeChannel?.id;
      if (!channelId) {
         await startChat();
         return;
      }

      const payload = {
         channelId,
         senderId: user.id || user.email,
         senderName: user.name,
         senderRole: "user",
         message: audioBase64 ? null : chatInput,
         audioData: audioBase64 || null
      };

      setChatInput("");

      try {
         const res = await fetch("/api/chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
         });
         if (res.ok) {
            fetchChatMessages(channelId);
         }
      } catch (err) {
         toast.error("Failed to send message");
      }
   };

   // Media Recorder Voice Functions
   const startRecording = async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         const recorder = new MediaRecorder(stream);
         setMediaRecorder(recorder);
         setAudioChunks([]);
         setRecordingDuration(0);

         recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
               setAudioChunks((prev) => [...prev, event.data]);
            }
         };

         recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
               const base64Audio = reader.result as string;
               handleSendChatMessage(undefined, base64Audio);
            };
            stream.getTracks().forEach((track) => track.stop());
         };

         recorder.start();
         setIsRecording(true);

         durationInterval.current = setInterval(() => {
            setRecordingDuration((prev) => prev + 1);
         }, 1000);
      } catch (err) {
         toast.error("Microphone access denied");
      }
   };

   const stopRecording = () => {
      if (mediaRecorder && isRecording) {
         mediaRecorder.stop();
         setIsRecording(false);
         clearInterval(durationInterval.current);
      }
   };

   const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
   };

   useEffect(() => {
      if (activeChannel && chatOpen) {
         clearInterval(pollInterval.current);
         pollInterval.current = setInterval(() => fetchChatMessages(activeChannel.id), 3000);
      } else {
         clearInterval(pollInterval.current);
      }
      return () => clearInterval(pollInterval.current);
   }, [activeChannel, chatOpen]);

  const cards = [
    { id: "orders", icon: Package, title: "Order History", desc: "Track, return, or cancel your orders" },
    { id: "settings", icon: UserCircle, title: "Account Settings", desc: "Edit name, password, and details" },
    { id: "addresses", icon: MapPin, title: "Saved Addresses", desc: "Edit and manage your shipping addresses" },
    { id: "payments", icon: CreditCard, title: "Payment Methods", desc: "Manage cards and billing options" },
    { id: "wishlist", icon: Heart, title: "Wishlists", desc: "View and shop your saved items" },
    { id: "support", icon: Headphones, title: "Customer Support", desc: "24/7 support and live chat" },
  ];

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
                    <div className="flex-1 flex flex-col justify-between">
                       <div>
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
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-emerald-100 text-emerald-700'
                          }`}>
                             {order.status === 'Pending' && <Clock className="w-4 h-4" />}
                             {order.status === 'Processing' && <Package className="w-4 h-4" />}
                             {order.status === 'Shipped' && <Truck className="w-4 h-4" />}
                             {order.status === 'Delivered' && <CheckCircle2 className="w-4 h-4" />}
                             {order.status === 'Cancelled' && <X className="w-4 h-4" />}
                             Status: {order.status}
                          </div>
                       </div>
                       
                       {order.status === 'Pending' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="mt-4 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors w-fit"
                          >
                             Cancel Order
                          </button>
                       )}
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
               {!showAddressForm && (
                 <button onClick={() => {
                   setEditingAddress(null);
                   setAddressTitle("");
                   setAddressFullName("");
                   setAddressStreet("");
                   setAddressCity("");
                   setAddressZip("");
                   setAddressCountry("");
                   setAddressDefault(false);
                   setShowAddressForm(true);
                 }} className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">Add New</button>
               )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 max-w-xl animate-in fade-in slide-in-from-top-2">
                 <h3 className="font-bold text-[#1A233A] text-lg">{editingAddress ? "Edit Address" : "Add Address"}</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500">Address Title (Home, Office)</label>
                       <input required type="text" value={addressTitle} onChange={e => setAddressTitle(e.target.value)} placeholder="e.g. Home" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#FF7A00] text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500">Recipient Name</label>
                       <input required type="text" value={addressFullName} onChange={e => setAddressFullName(e.target.value)} placeholder="e.g. John Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#FF7A00] text-sm" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Street Address</label>
                    <input required type="text" value={addressStreet} onChange={e => setAddressStreet(e.target.value)} placeholder="e.g. 123 Main St" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#FF7A00] text-sm" />
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500">City</label>
                       <input required type="text" value={addressCity} onChange={e => setAddressCity(e.target.value)} placeholder="Cairo" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#FF7A00] text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500">Zip / Postal Code</label>
                       <input required type="text" value={addressZip} onChange={e => setAddressZip(e.target.value)} placeholder="11511" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#FF7A00] text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500">Country</label>
                       <input required type="text" value={addressCountry} onChange={e => setAddressCountry(e.target.value)} placeholder="Egypt" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-[#FF7A00] text-sm" />
                    </div>
                 </div>
                 <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input type="checkbox" checked={addressDefault} onChange={e => setAddressDefault(e.target.checked)} className="accent-[#FF7A00] w-4 h-4" />
                    <span className="text-xs font-bold text-gray-600">Set as default address</span>
                 </label>
                 <div className="flex gap-4 pt-2">
                    <button type="submit" className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="text-gray-500 font-bold hover:underline text-sm">Cancel</button>
                 </div>
              </form>
            )}

            <div className="grid md:grid-cols-2 gap-6">
               {addresses.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No saved addresses yet.</p>
               ) : (
                  addresses.map(addr => (
                     <div key={addr.id} className={`bg-white rounded-2xl shadow-sm p-6 relative border-2 ${addr.isDefault ? 'border-[#FF7A00]' : 'border-gray-100'}`}>
                        {addr.isDefault && <span className="absolute top-4 right-4 bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Default</span>}
                        <h3 className="font-bold text-[#1A233A] mb-3 text-lg">{addr.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          {addr.fullName}<br/>
                          {addr.street}<br/>
                          {addr.city}, {addr.zip}<br/>
                          {addr.country}
                        </p>
                        <div className="mt-6 flex gap-4">
                           <button onClick={() => {
                              setEditingAddress(addr);
                              setAddressTitle(addr.title);
                              setAddressFullName(addr.fullName);
                              setAddressStreet(addr.street);
                              setAddressCity(addr.city);
                              setAddressZip(addr.zip);
                              setAddressCountry(addr.country);
                              setAddressDefault(addr.isDefault);
                              setShowAddressForm(true);
                           }} className="text-[#FF7A00] font-bold text-sm hover:underline">Edit</button>
                           <button onClick={() => {
                              if(confirm("Are you sure?")) {
                                 removeAddress(addr.id);
                                 toast.success("Address removed");
                              }
                           }} className="text-red-500 font-bold text-sm hover:underline">Remove</button>
                        </div>
                     </div>
                  ))
               )}
            </div>
          </motion.div>
        );
      case "payments":
        return (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-[#1A233A]">Payment Methods</h2>
               <button onClick={() => toast.info("Payment setup is simulation only")} className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">Add Card</button>
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
         return (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
             <h2 className="text-2xl font-bold text-[#1A233A] mb-6">My Wishlist</h2>
             {wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                   <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500 font-bold">Your wishlist is empty.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   {wishlist.map((item) => (
                     <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col relative group">
                        <button 
                          onClick={() => toggleWishlist(item)} 
                          className="absolute top-3 right-3 bg-gray-50 p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                        >
                           <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-5xl mb-4 overflow-hidden p-2">
                           {item.image.startsWith('data:') ? <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" /> : item.image}
                        </div>
                        <h3 className="font-bold text-[#1A233A] text-base line-clamp-1 mb-1">{item.name}</h3>
                        <p className="text-lg font-extrabold text-[#FF7A00] mb-4">${item.price.toFixed(2)}</p>
                        <button 
                          onClick={() => {
                             addToCart(item);
                             toast.success("Added to cart");
                          }}
                          className="mt-auto w-full bg-[#1A233A] hover:bg-[#FF7A00] text-white py-2 rounded-xl font-bold text-sm transition-colors"
                        >
                           Add to Cart
                        </button>
                     </div>
                   ))}
                </div>
             )}
           </motion.div>
         );
      case "settings":
         return (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
             <h2 className="text-2xl font-bold text-[#1A233A] mb-6">Account Settings</h2>
             <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 max-w-xl">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                   <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-gray-400 overflow-hidden shadow-inner border border-gray-200 flex-shrink-0">
                      {profileAvatar ? (
                         <img src={profileAvatar} className="w-full h-full object-cover" />
                      ) : (
                         <UserCircle className="w-12 h-12 text-gray-300" />
                      )}
                   </div>
                   <div>
                      <label className="bg-[#1A233A] hover:bg-[#FF7A00] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-block shadow-sm">
                         Upload Photo
                         <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                      <p className="text-gray-400 text-xs mt-1.5">JPG, PNG under 1MB</p>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-500">Full Name</label>
                   <input required type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-sm font-bold text-[#1A233A]" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-500">Email Address (Read-only)</label>
                   <input disabled type="email" value={user.email} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-bold text-gray-400 cursor-not-allowed" />
                </div>

                <div className="h-px bg-gray-100 my-4" />
                
                <h3 className="font-bold text-[#1A233A] text-lg">Change Password</h3>
                
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-500">Current Password</label>
                   <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-sm" />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-500">New Password</label>
                   <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-sm" />
                </div>

                <button type="submit" disabled={updatingProfile} className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50">
                   {updatingProfile ? "Saving Changes..." : "Save Changes"}
                </button>
             </form>
           </motion.div>
         );
      case "support":
         return (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
             <h2 className="text-2xl font-bold text-[#1A233A] mb-6">24/7 Customer Support</h2>
             <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
                   <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto"><MessageSquare className="w-6 h-6" /></div>
                   <h3 className="font-bold text-[#1A233A]">Live Chat</h3>
                   <p className="text-sm text-gray-500">Average response: 2 mins</p>
                   <button type="button" onClick={startChat} className="w-full bg-[#1A233A] hover:bg-[#FF7A00] text-white py-2 rounded-xl text-xs font-bold transition-colors">Start Chat</button>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto"><Headphones className="w-6 h-6" /></div>
                   <h3 className="font-bold text-[#1A233A]">Call Support</h3>
                   <p className="text-sm text-gray-500">Call Toll-Free: 19999</p>
                   <a href="tel:19999" className="w-full bg-[#1A233A] hover:bg-[#FF7A00] text-white py-2 rounded-xl text-xs font-bold transition-colors inline-block text-center">Call Now</a>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
                   <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto"><Send className="w-6 h-6" /></div>
                   <h3 className="font-bold text-[#1A233A]">Submit Ticket</h3>
                   <p className="text-sm text-gray-500">Get email support in 12h</p>
                   <button type="button" onClick={() => setShowTicketForm(true)} className="w-full bg-[#1A233A] hover:bg-[#FF7A00] text-white py-2 rounded-xl text-xs font-bold transition-colors">Submit Ticket</button>
                </div>
             </div>

             {showTicketForm && (
                <motion.form initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} onSubmit={handleSubmitTicket} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 max-w-xl animate-in fade-in slide-in-from-top-2">
                   <h3 className="font-bold text-[#1A233A] text-lg mb-2">Submit Support Ticket</h3>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500">Subject</label>
                      <input required type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} placeholder="e.g. Order #1234 delivery status" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-sm" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500">Message Details</label>
                      <textarea required value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} placeholder="Please detail your problem..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 transition-all text-sm" />
                   </div>
                   <div className="flex gap-4">
                      <button type="submit" className="bg-[#FF7A00] hover:bg-[#FF9900] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">Submit Ticket</button>
                      <button type="button" onClick={() => setShowTicketForm(false)} className="text-gray-500 font-bold hover:underline text-sm">Cancel</button>
                   </div>
                </motion.form>
             )}

             <div className="h-px bg-gray-100 my-8" />
             <h3 className="font-bold text-[#1A233A] text-xl mb-4">Your Support Tickets</h3>
             {loadingTickets ? (
                <p className="text-gray-500">Loading tickets...</p>
             ) : tickets.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No support tickets submitted yet.</p>
             ) : (
                <div className="space-y-4">
                   {tickets.map(ticket => (
                      <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
                         <div className="flex justify-between items-start">
                            <div>
                               <h4 className="font-bold text-[#1A233A]">{ticket.subject}</h4>
                               <p className="text-xs text-gray-500 mt-1">Ticket: {ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                              ticket.status === 'Replied' ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                               {ticket.status}
                            </span>
                         </div>
                         <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{ticket.message}</p>
                         {ticket.reply && (
                            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-4 space-y-2">
                               <p className="text-xs font-bold text-emerald-700">Support Response:</p>
                               <p className="text-sm text-gray-700">{ticket.reply}</p>
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             )}
           </motion.div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12 relative">
         
         {/* Profile Banner */}
         <div className="bg-[#1A233A] rounded-3xl p-8 mb-8 flex items-center gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00] opacity-10 blur-3xl rounded-full"></div>
            <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white relative z-10 border border-white/20 overflow-hidden">
               {user.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
               ) : (
                  <UserCircle className="w-12 h-12" />
               )}
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
                       onClick={() => setActiveTab(card.id)}
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

      {/* Floating Interactive Live Chat Modal */}
      <AnimatePresence>
         {chatOpen && (
            <motion.div 
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 100 }}
               className="fixed bottom-6 right-6 z-[100] w-[350px] h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            >
               {/* Chat Header */}
               <div className="bg-[#1A233A] px-4 py-3 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                     <MessageSquare className="w-5 h-5 text-[#FF7A00]" />
                     <span className="font-bold text-sm">Zayed Support (مساعد الدعم)</span>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-gray-300 hover:text-white">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               {/* Chat Messages */}
               <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-xs flex flex-col">
                  {chatMessages.length === 0 ? (
                     <p className="text-gray-400 text-center italic my-auto">ابدأ المحادثة مع الدعم الفني الآن</p>
                  ) : (
                     chatMessages.map((msg, i) => {
                        const isMe = msg.sender_role === 'user';
                        return (
                           <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                                 isMe ? 'bg-[#FF7A00] text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                              }`}>
                                 {msg.message && <p>{msg.message}</p>}
                                 {msg.audio_data && (
                                    <audio src={msg.audio_data} controls className="h-8 w-40 mt-1 outline-none bg-black/5 rounded" />
                                 )}
                                 <div className="flex justify-between gap-4 mt-1 opacity-70 text-[8px]">
                                    <span>{msg.sender_name}</span>
                                    <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                              </div>
                           </div>
                        );
                     })
                  )}
                  <div ref={chatEndRef} />
               </div>

               {/* Chat Input */}
               <form onSubmit={(e) => handleSendChatMessage(e)} className="p-3 border-t border-gray-100 flex gap-2 items-center bg-white">
                  <input 
                    type="text" 
                    value={chatInput} 
                    disabled={isRecording}
                    onChange={e => setChatInput(e.target.value)} 
                    placeholder={isRecording ? "جاري تسجيل الصوت..." : "اكتب رسالة..."} 
                    className="flex-1 bg-gray-50 rounded-xl px-3 py-2 outline-none text-xs focus:ring-1 focus:ring-[#FF7A00] disabled:opacity-50 text-[#1A233A] font-bold" 
                  />

                  {isRecording ? (
                     <div className="flex items-center gap-1 bg-red-50 text-red-500 px-2.5 py-1.5 rounded-xl border border-red-100 text-[10px]">
                        <span className="font-mono">{formatDuration(recordingDuration)}</span>
                        <button type="button" onClick={stopRecording} className="hover:bg-red-100 p-1 rounded-lg">
                           <Square className="w-3 h-3" />
                        </button>
                     </div>
                  ) : (
                     <button type="button" onClick={startRecording} className="p-2 bg-gray-50 hover:bg-[#FF7A00]/10 text-gray-500 hover:text-[#FF7A00] rounded-xl transition-all">
                        <Mic className="w-4 h-4" />
                     </button>
                  )}

                  <button type="submit" disabled={isRecording} className="bg-[#FF7A00] hover:bg-[#FF9900] text-white p-2 rounded-xl transition-colors disabled:opacity-50">
                     <Send className="w-4 h-4" />
                  </button>
               </form>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
