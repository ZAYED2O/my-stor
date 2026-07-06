"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useRef } from "react";
import { Lock, Store, LayoutDashboard, Package, PlusCircle, LogOut, Settings, MessageSquare, Send, Mic, Square, X, ChevronLeft, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type ChatView = 'menu' | 'chat';
type ChatTarget = 'seller_support' | 'seller_admin' | null;

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const isSellerAuth = useStore(state => state.isSellerAuth);
  const sellerLogin = useStore(state => state.sellerLogin);
  const user = useStore(state => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatView, setChatView] = useState<ChatView>('menu');
  const [chatTarget, setChatTarget] = useState<ChatTarget>(null);
  const [activeChannel, setActiveChannel] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // Audio recording
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

  const startChat = async (type: ChatTarget) => {
    if (!type) return;
    setLoadingChat(true);
    setChatTarget(type);
    try {
      const res = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          creator_id: user?.email || user?.id || 'seller-unknown',
          subject: type === 'seller_support' ? 'محادثة الدعم الفني' : 'محادثة مدير النظام',
          participant_id: null
        })
      });
      const data = await res.json();
      if (res.ok && data.channel) {
        setActiveChannel(data.channel);
        setChatView('chat');
        await fetchChatMessages(data.channel.id);
      } else {
        // Fallback - create local mock channel for UI demo
        const mockChannel = { id: `local-${Date.now()}`, type, status: 'open' };
        setActiveChannel(mockChannel);
        setChatView('chat');
        toast.error("تعذر الاتصال بالخادم، يعمل في وضع محدود");
      }
    } catch (err) {
      // Still show chat view with empty state
      const mockChannel = { id: `local-${Date.now()}`, type, status: 'open' };
      setActiveChannel(mockChannel);
      setChatView('chat');
    } finally {
      setLoadingChat(false);
    }
  };

  const fetchChatMessages = async (channelId: string) => {
    if (channelId.startsWith('local-')) return;
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
    if (activeChannel.id.startsWith('local-')) {
      toast.error("الاتصال غير متاح حاليًا");
      return;
    }

    const text = chatInput;
    setChatInput("");

    const payload = {
      channelId: activeChannel.id,
      senderId: user.id || user.email,
      senderName: user.name,
      senderRole: 'seller',
      message: audioBase64 ? null : text,
      audioData: audioBase64 || null
    };

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
      const chunks: Blob[] = [];
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingDuration(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          handleSendChatMessage(undefined, reader.result as string);
        };
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      durationInterval.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
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

  const closeChat = () => {
    setChatOpen(false);
    setTimeout(() => {
      setChatView('menu');
      setActiveChannel(null);
      setChatTarget(null);
      setChatMessages([]);
    }, 300);
  };

  const goBackToMenu = () => {
    setChatView('menu');
    setActiveChannel(null);
    setChatTarget(null);
    setChatMessages([]);
    clearInterval(pollInterval.current);
  };

  useEffect(() => {
    if (activeChannel && !activeChannel.id.startsWith('local-') && chatOpen && chatView === 'chat') {
      clearInterval(pollInterval.current);
      pollInterval.current = setInterval(() => fetchChatMessages(activeChannel.id), 3000);
    } else {
      clearInterval(pollInterval.current);
    }
    return () => clearInterval(pollInterval.current);
  }, [activeChannel, chatOpen, chatView]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const chatTargetLabel = chatTarget === 'seller_support' ? 'الدعم الفني وخدمة العملاء' : chatTarget === 'seller_admin' ? 'مدير النظام (Super Admin)' : '';

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
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seller Email Address" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-4 outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]" />
          </div>
          <div className="w-full relative mb-6">
            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]" />
          </div>
          <button type="submit" className="w-full bg-[#FF7A00] text-white font-bold py-3 rounded-xl hover:bg-[#FF9900] transition-colors">Login to Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="font-extrabold text-[#1A233A] tracking-tight ml-2">ZAYED <span className="text-[#FF7A00]">SELLER</span></span>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-[#FF7A00]/10 text-[#FF7A00]' : 'text-gray-500 hover:text-[#1A233A] hover:bg-gray-50'}`}>
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {children}

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6 z-[100]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => chatOpen ? closeChat() : setChatOpen(true)}
            className="bg-[#FF7A00] hover:bg-[#FF9900] text-white w-14 h-14 rounded-full shadow-2xl transition-all flex items-center justify-center border-4 border-white"
          >
            {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Chat Window */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed bottom-24 right-6 z-[100] w-[370px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              style={{ height: chatView === 'menu' ? 'auto' : '500px' }}
            >
              {/* Header */}
              <div className="bg-[#1A233A] px-5 py-4 flex items-center gap-3 text-white flex-shrink-0">
                {chatView === 'chat' && (
                  <button onClick={goBackToMenu} className="p-1.5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-9 h-9 bg-[#FF7A00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm leading-tight truncate">
                    {chatView === 'chat' ? chatTargetLabel : 'محادثة الدعم الفني'}
                  </p>
                  {chatView === 'chat' && (
                    <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                      متصل الآن
                    </p>
                  )}
                </div>
                <button onClick={closeChat} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu View */}
              {chatView === 'menu' && (
                <div className="p-5 flex flex-col gap-3 bg-gray-50/60">
                  <p className="text-gray-500 text-xs font-bold text-right mb-1">:اختر الجهة التي تود التواصل معها</p>

                  {/* Support Button */}
                  <button
                    onClick={() => startChat('seller_support')}
                    disabled={loadingChat}
                    className="w-full p-4 bg-white border-2 border-transparent hover:border-[#FF7A00] rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-lg transition-all text-right group disabled:opacity-60"
                  >
                    <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-sm text-[#1A233A]">الدعم الفني وخدمة العملاء</h3>
                      <p className="text-xs text-gray-400 mt-0.5">لحل مشاكل الحساب والمبيعات</p>
                    </div>
                  </button>

                  {/* Admin Button */}
                  <button
                    onClick={() => startChat('seller_admin')}
                    disabled={loadingChat}
                    className="w-full p-4 bg-white border-2 border-transparent hover:border-[#FF7A00] rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-lg transition-all text-right group disabled:opacity-60"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 group-hover:bg-orange-100 text-[#FF7A00] flex items-center justify-center flex-shrink-0 transition-colors">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-sm text-[#1A233A]">مدير النظام (Super Admin)</h3>
                      <p className="text-xs text-gray-400 mt-0.5">للطلبات والاستفسارات الخاصة بالمتجر</p>
                    </div>
                  </button>

                  {loadingChat && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-400 font-bold">
                      <div className="w-3 h-3 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
                      جاري الاتصال...
                    </div>
                  )}
                </div>
              )}

              {/* Chat View */}
              {chatView === 'chat' && (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/80">
                    {chatMessages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
                        <div className="w-14 h-14 bg-[#FF7A00]/10 rounded-2xl flex items-center justify-center">
                          <MessageSquare className="w-7 h-7 text-[#FF7A00]" />
                        </div>
                        <p className="text-gray-400 text-xs font-bold text-center leading-relaxed">
                          لا توجد رسائل بعد<br />
                          <span className="text-gray-300">ابدأ المحادثة وسيرد عليك الفريق قريبًا</span>
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => {
                        const isMe = msg.sender_role === 'seller';
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                            {!isMe && (
                              <div className="w-7 h-7 rounded-full bg-[#1A233A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mb-1">
                                {(msg.sender_name || 'S').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${isMe ? 'bg-[#FF7A00] text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                              {msg.message && <p className="text-sm">{msg.message}</p>}
                              {msg.audio_data && (
                                <audio src={msg.audio_data} controls className="h-8 w-44 mt-1 outline-none rounded" />
                              )}
                              <span className={`block text-right text-[9px] mt-1.5 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleSendChatMessage} className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center bg-white flex-shrink-0">
                    {isRecording ? (
                      <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <span className="text-red-500 text-xs font-bold font-mono flex-1">{formatDuration(recordingDuration)}</span>
                        <button type="button" onClick={stopRecording} className="text-red-500 hover:text-red-700 transition-colors">
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 outline-none text-sm focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/10 text-[#1A233A] transition-all placeholder:text-gray-400"
                        dir="rtl"
                      />
                    )}

                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-[#FF7A00]/10 text-gray-500 hover:text-[#FF7A00]'}`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      disabled={isRecording || !chatInput.trim()}
                      className="w-10 h-10 bg-[#FF7A00] hover:bg-[#FF9900] text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 shadow-md shadow-orange-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
