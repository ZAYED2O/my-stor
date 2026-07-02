"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { MessageSquare, Users, ShieldAlert, Store, LogOut, Send, Mic, Square, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportDashboard() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const router = useRouter();

  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState("");
  const [filterType, setFilterType] = useState<"customer" | "seller">("customer");
  const [loadingChannels, setLoadingChannels] = useState(true);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationInterval = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<any>(null);
  const channelsInterval = useRef<any>(null);

  // Redirect if not authenticated as support/admin
  useEffect(() => {
    if (!user || (user.role !== "support" && user.role !== "super_admin")) {
      toast.error("Unauthorized access");
      router.push("/support-login");
    } else {
      fetchChannels();
      // Poll channels list every 5 seconds
      channelsInterval.current = setInterval(fetchChannels, 5000);
    }

    return () => {
      clearInterval(channelsInterval.current);
      clearInterval(pollingInterval.current);
    };
  }, [user, router]);

  // Load and poll messages when channel is selected
  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
      clearInterval(pollingInterval.current);
      pollingInterval.current = setInterval(() => fetchMessages(selectedChannel.id), 3000);
    } else {
      setMessages([]);
      clearInterval(pollingInterval.current);
    }
    return () => clearInterval(pollingInterval.current);
  }, [selectedChannel]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/chat/channels?role=${user?.role}&userId=${user?.id}`);
      const data = await res.json();
      if (res.ok) {
        setChannels(data.channels || []);
      }
    } catch (err) {
      console.error("Failed to load chat channels");
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?channelId=${channelId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, audioBase64?: string) => {
    if (e) e.preventDefault();
    if (!textInput.trim() && !audioBase64) return;
    if (!selectedChannel || !user) return;

    const payload = {
      channelId: selectedChannel.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: "support",
      message: audioBase64 ? null : textInput,
      audioData: audioBase64 || null
    };

    setTextInput("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchMessages(selectedChannel.id);
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const handleResolveChannel = async (channelId: string) => {
    try {
      const res = await fetch("/api/chat/channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, status: "closed" })
      });
      if (res.ok) {
        toast.success("Chat resolved & archived");
        setSelectedChannel(null);
        fetchChannels();
      } else {
        toast.error("Failed to resolve chat");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // Recording Handlers
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
          handleSendMessage(undefined, base64Audio);
        };
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);

      durationInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied or unavailable");
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

  const handleSignOut = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/support-login");
  };

  const filteredChannels = channels.filter((c) => {
    if (filterType === "customer") return c.type === "customer_support";
    return c.type === "seller_support";
  });

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar - Channels List */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#FF7A00]" />
            <span className="font-extrabold text-lg tracking-tight">Support Hub</span>
          </div>
          <button onClick={handleSignOut} title="Sign Out" className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 p-3 bg-slate-950/60 m-3 rounded-xl border border-slate-800/40">
          <button
            onClick={() => { setFilterType("customer"); setSelectedChannel(null); }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${filterType === "customer" ? "bg-[#FF7A00] text-white" : "text-slate-400 hover:text-white"}`}
          >
            <Users className="w-4 h-4" /> Customer Chats
          </button>
          <button
            onClick={() => { setFilterType("seller"); setSelectedChannel(null); }}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${filterType === "seller" ? "bg-[#FF7A00] text-white" : "text-slate-400 hover:text-white"}`}
          >
            <Store className="w-4 h-4" /> Seller Chats
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {loadingChannels ? (
            <p className="text-slate-500 text-xs text-center py-8">Loading active sessions...</p>
          ) : filteredChannels.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-xs font-bold">No active chat sessions</p>
            </div>
          ) : (
            filteredChannels.map((chan) => {
              const isSelected = selectedChannel?.id === chan.id;
              return (
                <div
                  key={chan.id}
                  onClick={() => setSelectedChannel(chan)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex flex-col ${isSelected ? "bg-[#FF7A00]/10 border-[#FF7A00] text-white" : "bg-slate-950/40 border-slate-800/40 text-slate-300 hover:bg-slate-800/50"}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-slate-100 line-clamp-1">{chan.creator_id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${chan.status === 'open' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                      {chan.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-1 italic">{chan.subject}</p>
                  <span className="text-[10px] text-slate-500 mt-2 self-end">{new Date(chan.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 bg-slate-950 flex flex-col h-full relative">
        {selectedChannel ? (
          <>
            {/* Top Workspace Header */}
            <div className="p-5 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10 shadow-md">
              <div>
                <h2 className="font-extrabold text-lg flex items-center gap-2">
                  <span>Chat Session with {selectedChannel.creator_id}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedChannel.subject}</p>
              </div>
              {selectedChannel.status === "open" && (
                <button
                  onClick={() => handleResolveChannel(selectedChannel.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Resolved
                </button>
              )}
            </div>

            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/20">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl p-4 leading-relaxed shadow-lg ${isMe ? "bg-[#FF7A00] text-white rounded-tr-none" : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"}`}>
                      {msg.message && <p className="text-sm">{msg.message}</p>}
                      {msg.audio_data && (
                        <div className="flex items-center gap-3">
                          <audio src={msg.audio_data} controls className="h-9 w-48 rounded-lg outline-none bg-black/10" />
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4 mt-2">
                        <span className="text-[9px] text-white/70 uppercase font-bold">{msg.sender_role} • {msg.sender_name}</span>
                        <span className="text-[9px] text-white/50">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Workspace */}
            {selectedChannel.status === "open" ? (
              <form onSubmit={(e) => handleSendMessage(e)} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3 z-10 shadow-lg">
                <input
                  type="text"
                  value={textInput}
                  disabled={isRecording}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isRecording ? "قيد تسجيل الملاحظة الصوتية..." : "Type your response..."}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-[#FF7A00] outline-none text-white transition-all disabled:opacity-50 placeholder:text-slate-600"
                />

                {isRecording ? (
                  <div className="flex items-center gap-2 bg-red-600/10 border border-red-500/20 px-4 py-2.5 rounded-2xl text-red-500">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold font-mono">{formatDuration(recordingDuration)}</span>
                    <button type="button" onClick={stopRecording} className="ml-2 hover:bg-red-500/20 p-1.5 rounded-lg transition-all" title="Stop & Send">
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={startRecording} className="p-3.5 bg-slate-950 border border-slate-800 hover:border-[#FF7A00]/40 text-slate-400 hover:text-[#FF7A00] rounded-2xl active:scale-95 transition-all">
                    <Mic className="w-5 h-5" />
                  </button>
                )}

                <button type="submit" disabled={isRecording} className="bg-[#FF7A00] hover:bg-[#FF9900] text-white p-3.5 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="p-5 bg-slate-900/60 text-center border-t border-slate-800 text-slate-500 text-sm font-bold">
                This chat session is closed & archived.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-950/40">
            <MessageSquare className="w-16 h-16 text-slate-800 mb-4" />
            <h3 className="text-xl font-extrabold text-slate-400">Support Chat Workspace</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">Select an active customer or seller chat session from the sidebar to start responding.</p>
          </div>
        )}
      </main>
    </div>
  );
}
