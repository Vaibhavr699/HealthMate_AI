"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Logo from "../../assets/MetaIcon.png";
import {
  Menu,
  X,
  Plus,
  Search,
  Send,
  Paperclip,
  Trash2,
  LogOut,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Loader2,
  User,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, chatId: null });
  const messagesEndRef = useRef(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auth guard + initial data load
  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    (async () => {
      await fetchChats();
      const loadChatId = typeof window !== "undefined" ? localStorage.getItem("loadChatId") : null;
      if (loadChatId) {
        setActiveChatId(loadChatId);
        localStorage.removeItem("loadChatId");
        await fetchMessages(loadChatId);
      }
      setLoading(false);
    })();
  }, [user]);

  async function fetchChats() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, { headers });
      const data = await res.json();
      if (res.ok) {
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  }

  async function fetchMessages(chatId) {
    if (!chatId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/${chatId}`, { headers });
      const data = await res.json();
      if (res.ok && data.chat) {
        setMessages(
          (data.chat.messages || []).map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            id: m.id,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      e.target.value = "";
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
  };

  const sendMessage = async () => {
    if (!input.trim() && !attachedFile) return;
    setSending(true);

    try {
      let messageText = input.trim();
      if (attachedFile) {
        const form = new FormData();
        form.append("file", attachedFile);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Upload failed");
        }
        const fileName = uploadData?.file?.originalName || attachedFile.name;
        messageText = messageText || `Please analyze the uploaded file: ${fileName}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/message`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: messageText, chatId: activeChatId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      if (!activeChatId && data.chatId) {
        setActiveChatId(data.chatId);
      }

      setMessages(
        (data.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          id: m.id,
        }))
      );

      fetchChats();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setInput("");
      setAttachedFile(null);
      setSending(false);
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput("");
    setAttachedFile(null);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/${chatId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setMessages([]);
        }
        await fetchChats();
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    } finally {
      setDeleteModal({ show: false, chatId: null });
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="glass-card p-8 rounded-2xl text-center shadow-xl border border-white/50">
          <LoadingSpinner message="Loading Dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar with Glassmorphism */}
      <div className="h-16 glass-navbar border-b border-white/30 px-4 lg:px-6 flex items-center justify-between shadow-lg flex-shrink-0 relative z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/30 rounded-xl transition-all duration-300 text-slate-700 hover:text-blue-600 hover:scale-110 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-icon rounded-xl flex items-center justify-center">
              <Image src={Logo} alt="" className="h-10 w-10"></Image>
            </div>
            <div>
              <h2 className="font-bold text-base lg:text-lg text-slate-800">
                HealthMate AI
              </h2>
              <p className="text-xs text-slate-600 hidden sm:block">
                Your Medical Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm text-slate-700 hidden md:block font-medium">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar with Glassmorphism */}
        <div
          className={`fixed lg:relative inset-y-0 top-16 lg:top-0 left-0 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } w-80 transition-transform duration-300 ease-in-out glass-sidebar border-r border-white/30 flex flex-col overflow-hidden shadow-2xl`}
        >
          <div className="p-4 border-b border-white/30">
            <button
              onClick={startNewChat}
              className="w-full glass-primary text-white px-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-black/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input border border-black/40 rounded-xl focus:ring-2 focus:ring-blue-400 placeholder:text-slate-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {filteredChats.length === 0 ? (
              <div className="p-6 text-center text-slate-600">
                {searchQuery ? "No chats found" : "No previous chats"}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group p-3 cursor-pointer rounded-xl transition-all duration-300 ${activeChatId === chat.id
                        ? "glass-active shadow-md scale-[1.02]"
                        : "hover:glass-hover"
                      }`}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      fetchMessages(chat.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare
                            className={`w-4 h-4 ${activeChatId === chat.id
                                ? "text-blue-600"
                                : "text-slate-500"
                              }`}
                          />
                          <div className="font-medium text-sm truncate text-slate-900">
                            {chat.title}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 pl-6">
                          {new Date(chat.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({ show: true, chatId: chat.id });
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50/50 transition-all duration-300 transform hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/30 glass-footer space-y-2">
            <Link href="/history" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:glass-hover text-sm text-slate-700 hover:text-blue-600 transition-all duration-300 font-medium">
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </Link>
            <button onClick={() => { logout(); router.push("/auth/signin"); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50/50 text-sm text-red-600 transition-all duration-300 font-medium cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-14 glass-header border-b border-white/30 px-4 lg:px-6 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="font-semibold text-slate-900 text-base lg:text-lg">
                {activeChatId
                  ? chats.find((c) => c.id === activeChatId)?.title || "Chat"
                  : "New Conversation"}
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                AI-powered health assistance
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && !activeChatId ? (
                <div className="text-center text-slate-600 py-12">
                  <div className="w-16 h-16 glass-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-medium mb-2 text-slate-800">Start a new conversation</p>
                  <p className="text-sm text-slate-500">Get medical insights powered by AI</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                      } animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${m.role === "user"
                          ? "glass-primary text-white"
                          : "glass-message text-slate-800 border border-white/40"
                        }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${m.role === "user"
                            ? "text-white/80"
                            : "text-slate-500"
                          }`}
                      >
                        {new Date(m.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-white/30 glass-input-area p-4 lg:p-6 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <input
                id="chat-file-input"
                type="file"
                accept=".pdf,.csv,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {attachedFile && (
                <div className="mb-3 glass-attachment border border-emerald-300/50 rounded-2xl p-3 flex items-center justify-between shadow-md animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100/50 rounded-xl flex items-center justify-center shadow-sm">
                      <Paperclip className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate text-slate-900">
                        {attachedFile.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {(attachedFile.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeAttachment}
                    className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50/50 transition-all duration-300 hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <button
                  onClick={() => document.getElementById("chat-file-input")?.click()}
                  disabled={sending}
                  title="Attach medical file"
                  className={`relative p-3 rounded-2xl transition-all duration-300 
    hover:scale-110 active:scale-95 shadow-lg border border-black/40
    ${attachedFile
                      ? "bg-emerald-50/80 text-emerald-700 hover:shadow-emerald-200"
                      : "bg-white/30 text-slate-700 hover:bg-white/40 hover:shadow-md"
                    } 
    backdrop-blur-md hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-500 blur-md opacity-0 
      ${attachedFile ? "bg-emerald-300/40" : "bg-sky-300/30"} 
      group-hover:opacity-100`}
                  ></span>
                  <Paperclip className="relative z-10 w-5 h-5" />
                </button>



                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={
                      attachedFile
                        ? "Add a message (optional)..."
                        : "Type your message..."
                    }
                    className="w-full glass-input border border-black/40 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm placeholder:text-slate-500 shadow-md transition-all duration-300"
                    disabled={sending}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={(!input.trim() && !attachedFile) || sending}
                  className={`glass-primary text-white bg-blue-400 p-3 rounded-2xl font-medium 
    transition-all duration-300 shadow-lg border border-black/40
    hover:scale-110 active:scale-95 hover:shadow-xl 
    disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                  title="Send message"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>

              </div>

              <p className="text-xs text-slate-600 mt-3 text-center">
                ⚠️ HealthMate AI can make mistakes. Check important medical
                information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDeleteModal({ show: false, chatId: null })}
          />
          <div className="relative glass-modal rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/50 animate-scaleIn">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100/50 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 text-slate-900">
              Delete Conversation?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              This action cannot be undone. This will permanently delete the conversation and all its messages.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, chatId: null })}
                className="flex-1 px-4 py-3 glass-secondary border border-white/40 rounded-xl font-semibold text-slate-700 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteChat(deleteModal.chatId)}
                className="flex-1 px-4 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-red-600/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg border border-red-400/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        /* Glassmorphism Styles */
        .glass-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-navbar {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .glass-sidebar {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .glass-header {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .glass-input-area {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .glass-modal {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .glass-primary {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-secondary {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-status {
          background: rgba(16, 185, 129, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-active {
          background: rgba(59, 130, 246, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-hover {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-footer {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .glass-message {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-attachment {
          background: rgba(16, 185, 129, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .glass-attachment-btn {
          background: rgba(16, 185, 129, 0.2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 20px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
}