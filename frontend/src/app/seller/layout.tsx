"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useRef } from "react";
import { Lock, Store, LayoutDashboard, Package, PlusCircle, LogOut, Settings, MessageSquare, Send, Mic, Square, X, ChevronLeft, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const isSellerAuth = useStore(state => state.isSellerAuth);
  const sellerLogin = useStore(state => state.sellerLogin);
  const user = useStore(state => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Seller Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any | null>(null);
  const [chatType, setChatType] = useState<'seller_support' | 'seller_admin' | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationInterval = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<any>(null);

  const navLinks = [
    { name: "Dashboard", href: "/seller", icon: LayoutDashboard },
    { name: "Inventory", href: "/seller/products", icon: Package },
    { name: "Add Product", href: "/seller/products/add", icon: PlusCircle },
    { name: "Settings", href: "/seller/settings", icon: Settings },
  ];

  useEffect(() => setIsMounted(true), []);

  // Auto-authenticate if user is already logged in with seller or super_admin role
  useEffect(() => {
    if (isMounted && !isSellerAuth && user && ((user as any).role === 'seller' || (user as any).role === 'super_admin')) {
      sellerLogin();
    }
  }, [isMounted, isSellerAuth, user, sellerLogin]);

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
           if (data.user.role === 'seller' || data.user.role === 'super_admin') {
              sellerLogin();
              useStore.getState().login(data.user);
              toast.success("Welcome to your Seller Hub");
           } else {
              toast.error("Access Denied. You are not a registered seller.");
           }
        } else {
           toast.error(data.error || "Login failed");
        }
     } catch (err) {
        toast.error("An error occurred");
     }
  };

  const startChat = async (type: 'seller_support' | 'seller_admin') => {
      setChatType(type);
      try {
         const res = await fetch("/api/chat/channels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               type,
               creator_id: user?.email || 'Seller',
               subject: type === 'seller_support' ? 'Seller to Support/CS' : 'Seller to Super Admin',
               participant_id: type === 'seller_admin' ? 'admin-001' : null
            })
         });
         const data = await res.json();
         if (res.ok && data.channel) {
            setActiveChannel(data.channel);
            fetchChatMessages(data.channel.id);
         }
      } catch (err) {
         toast.error("Failed to start chat session");
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
         console.error("Error fetching chat messages");
      }
   };

   const handleSendChatMessage = async (e?: React.FormEvent, audioBase64?: string) => {
      if (e) e.preventDefault();
      if (!chatInput.trim() && !audioBase64) return;
      if (!activeChannel || !user) return;

      const payload = {
         channelId: activeChannel.id,
         senderId: user.id || user.email,
         senderName: user.name,
         senderRole: 'seller',
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
            fetchChatMessages(activeChannel.id);
         }
      } catch (err) {
         toast.error("Failed to send message");
      }
   };

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
         toast.error("Microphone access unavailable");
      }
   };

   const stopRecording = () => {
      if (mediaRecorder && isRecording) {
         mediaRecorder.stop();
         setIsRecording(false);
         clearInterval(durationInterval.current);
      }
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

   useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [chatMessages]);

   const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
   };

  if (!isMounted) return null;

  if (!isSellerAuth) {
     return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
           <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl max-w-md w-full shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 mb-4 flex items-center justify-center">
                 <img src="/logo.png" alt="ZAYED EXPRESS" className="max-w-full max-h-full object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1A233A] mb-2">Seller Hub</h1>
              <p className="text-gray-500 text-sm mb-8 text-center">Login with your registered seller account.</p>
              
              <div className="w-full relative mb-4">
                 <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seller Email Address" 
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
              
              <button type="submit" className="w-full bg-[#FF7A00] text-white font-bold py-3 rounded-xl hover:bg-[#FF9900] transition-colors">
                 Login to Dashboard
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
              <span className="font-extrabold text-[#1A233A] tracking-tight ml-2">ZAYED <span className="text-[#FF7A00]">SELLER</span></span>
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
                    <Store className="w-5 h-5" /> Back to Store
                 </Link>
              </div>
           </nav>
           
           <div className="p-4 border-t border-gray-100">
              <button onClick={() => useStore.getState().sellerLogout()} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                 <LogOut className="w-5 h-5" /> Sign Out
              </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
           {children}

           {/* Floating Chat Button */}
           <div className="fixed bottom-6 right-6 z-[100]">
              <button 
                 onClick={() => setChatOpen(!chatOpen)}
                 className="bg-[#FF7A00] hover:bg-[#FF9900] text-white p-4 rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center border border-white/10"
              >
                 {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
              </button>
           </div>

           {/* Seller Chat Modal */}
           <AnimatePresence>
              {chatOpen && (
                 <div className="fixed bottom-24 right-6 z-[100] w-[360px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-[#1A233A] px-4 py-3.5 flex justify-between items-center text-white">
                       <div className="flex items-center gap-2">
                          {activeChannel && (
                             <button onClick={() => { setActiveChannel(null); setChatType(null); }} className="p-1 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                             </button>
                          )}
                          <MessageSquare className="w-5 h-5 text-[#FF7A00]" />
                          <span className="font-bold text-sm">
                             {chatType === 'seller_support' ? 'محادثة الدعم الفني' : chatType === 'seller_admin' ? 'محادثة مدير النظام' : 'مركز التواصل للبائع'}
                          </span>
                       </div>
                       <button onClick={() => setChatOpen(false)} className="text-gray-300 hover:text-white">
                          <X className="w-5 h-5" />
                       </button>
                    </div>

                    {/* Chat selection menu if no channel active */}
                    {!activeChannel ? (
                       <div className="flex-1 p-6 flex flex-col justify-center gap-4 bg-gray-50/50">
                          <p className="text-gray-500 text-xs font-bold text-center mb-2">اختر الجهة التي تود التواصل معها:</p>
                          <button 
                             onClick={() => startChat('seller_support')}
                             className="w-full p-4 bg-white border border-gray-200 hover:border-[#FF7A00] rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-right"
                          >
                             <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <Users className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="font-bold text-sm text-[#1A233A]">الدعم الفني وخدمة العملاء</h3>
                                <p className="text-xs text-gray-400 mt-0.5">لحل مشاكل الحساب والمبيعات</p>
                             </div>
                          </button>
                          <button 
                             onClick={() => startChat('seller_admin')}
                             className="w-full p-4 bg-white border border-gray-200 hover:border-[#FF7A00] rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-right"
                          >
                             <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                                <Store className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="font-bold text-sm text-[#1A233A]">مدير النظام (Super Admin)</h3>
                                <p className="text-xs text-gray-400 mt-0.5">للطلبات والاستفسارات الخاصة بالمتجر</p>
                             </div>
                          </button>
                       </div>
                    ) : (
                       <>
                          {/* Chat Messages */}
                          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-xs flex flex-col">
                             {chatMessages.length === 0 ? (
                                <p className="text-gray-400 text-center italic my-auto">لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
                             ) : (
                                chatMessages.map((msg, i) => {
                                   const isMe = msg.sender_role === 'seller';
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

                          {/* Message Input & Voice */}
                          <form onSubmit={(e) => handleSendChatMessage(e)} className="p-3 border-t border-gray-100 flex gap-2 items-center bg-white">
                             <input 
                                type="text" 
                                value={chatInput} 
                                disabled={isRecording}
                                onChange={e => setChatInput(e.target.value)} 
                                placeholder={isRecording ? "جاري التسجيل..." : "اكتب رسالة..."} 
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
                       </>
                    )}
                 </div>
              )}
           </AnimatePresence>
        </div>
      </div>
   );
}
