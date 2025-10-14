"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('chat');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputId = 'chat-file-input';
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else {
      setLoading(false);
      fetchChats();
      fetchFiles();
    }
  }, [user, router]);

  useEffect(() => {
    const chatIdToLoad = localStorage.getItem('loadChatId');
    if (chatIdToLoad && chats.length > 0) {
      fetchChat(chatIdToLoad);
      localStorage.removeItem('loadChatId');
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }), [token]);

  async function fetchChats() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load chats');
      setChats(data.chats || []);
    } catch (e) {
      show({ type: 'error', title: 'Chats', message: e.message });
    }
  }

  async function fetchFiles() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load files');
      setUploadedFiles(data.files || []);
    } catch (e) {
      console.error('Error fetching files:', e);
    }
  }

  async function fetchChat(id) {
    try {
      setActiveChatId(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/${id}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load chat');
      
      // Get current file messages before replacing
      const currentFileMessages = messages.filter(m => m.role === 'file');
      const chatMessages = data.chat?.messages || [];
      
      // Merge: keep file messages + add chat messages
      setMessages([...currentFileMessages, ...chatMessages]);
    } catch (e) {
      show({ type: 'error', title: 'Chat', message: e.message });
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Just attach the file, don't upload yet
    setAttachedFile(file);
    
    // Clear the file input so same file can be selected again
    e.target.value = '';
  }
  
  async function removeAttachment() {
    setAttachedFile(null);
  }
  
  async function sendMessage() {
    if (!input.trim() && !attachedFile) return;
    
    const userMessage = input;
    const fileToUpload = attachedFile;
    
    setInput('');
    setAttachedFile(null);
    setSending(true);
    
    try {
      let uploadedFileData = null;
      
      // Upload file first if attached
      if (fileToUpload) {
        const uploadMsg = {
          role: 'system',
          content: `📎 Uploading ${fileToUpload.name}...`,
          timestamp: new Date().toISOString(),
          id: 'temp-upload-' + Date.now()
        };
        setMessages(prev => [...prev, uploadMsg]);
        
        const form = new FormData();
        form.append('file', fileToUpload);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          body: form
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'Upload failed');
        }
        
        uploadedFileData = uploadData.file;
        const fileType = uploadedFileData.fileType === 'application/pdf' ? 'PDF' : 
                        uploadedFileData.fileType === 'text/csv' ? 'CSV' : 'Image';
        const fileSize = (uploadedFileData.fileSize / 1024).toFixed(2);
        
        const fileMsg = {
          role: 'file',
          content: fileToUpload.name,
          timestamp: new Date().toISOString(),
          id: 'file-' + uploadedFileData.id,
          fileData: {
            name: fileToUpload.name,
            type: fileType,
            size: fileSize + ' KB',
            extractedData: uploadedFileData.hasExtractedData,
            pages: uploadedFileData.extractedData?.numPages
          }
        };
        
        setMessages(prev => prev.map(m => m.id === uploadMsg.id ? fileMsg : m));
        await fetchFiles();
      }
      
      // Add user message + loading indicator
      const finalMessage = userMessage || (uploadedFileData ? `What does this file show?` : '');
      
      const tempUserMsg = {
        role: 'user',
        content: finalMessage,
        timestamp: new Date().toISOString(),
        id: 'temp-user-' + Date.now()
      };
      
      const tempLoadingMsg = {
        role: 'assistant',
        content: 'typing',
        timestamp: new Date().toISOString(),
        id: 'temp-loading'
      };
      
      setMessages(prev => [...prev, tempUserMsg, tempLoadingMsg]);
      
      // Send message to AI
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: finalMessage, chatId: activeChatId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      
      // Keep file messages and merge with new messages
      setMessages(prev => {
        // Get all file messages from previous state
        const fileMessages = prev.filter(m => m.role === 'file');
        // Get new messages from server (excluding temp messages)
        const newMessages = data.messages || [];
        
        // Merge: files first, then new messages
        return [...fileMessages, ...newMessages];
      });
      setActiveChatId(data.chatId);
      await fetchChats();
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== 'temp-loading'));
      show({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setSending(false);
    }
  }

  async function startNewChat() {
    setActiveChatId(null);
    // Keep file messages when starting new chat
    setMessages(prev => prev.filter(m => m.role === 'file'));
    setInput('');
    setAttachedFile(null);
  }

  async function deleteChat(chatId) {
    if (!confirm('Delete this conversation?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/${chatId}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete');
      show({ type: 'success', title: 'Deleted', message: 'Chat deleted' });
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
      await fetchChats();
    } catch (e) {
      show({ type: 'error', title: 'Delete failed', message: e.message });
    }
  }

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  if (loading) {
    return <LoadingSpinner message="Loading your health assistant..." />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r flex flex-col overflow-hidden`}>
        <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">HealthMate AI</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-white/20 rounded"
            >
              ✕
            </button>
          </div>
          <div className="text-sm opacity-90">
            {user?.name || user?.email}
          </div>
        </div>

        <div className="p-3 border-b">
          <button
            onClick={startNewChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <span className="text-xl">+</span>
            <span>New Chat</span>
          </button>
        </div>

        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchQuery ? 'No chats found' : 'No previous chats'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition ${
                    activeChatId === chat.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                  }`}
                  onClick={() => fetchChat(chat.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete chat"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t space-y-2">
          <button
            onClick={() => router.push('/history')}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2"
          >
            📊 <span>View Analytics</span>
          </button>
          <button
            onClick={() => router.push('')}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2"
          >
            🚪 <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
      <div className="h-14 bg-white border-b px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ☰
              </button>
            )}
            <div className="font-semibold text-gray-800">
              {activeChatId 
                ? chats.find(c => c.id === activeChatId)?.title || 'Chat'
                : 'New Conversation'}
            </div>
          </div>
          
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !activeChatId ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">🏥</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to HealthMate AI
                </h2>
                <p className="text-gray-600 mb-6">
                  Your intelligent medical assistant with semantic memory. 
                  Ask questions, upload medical files, and get personalized insights.
                </p>
                <div className="grid grid-cols-1 gap-3 text-left">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="font-medium text-sm mb-1">💬 Smart Conversations</div>
                    <div className="text-xs text-gray-600">Ask about your health, medications, or symptoms</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="font-medium text-sm mb-1">📄 Document Analysis</div>
                    <div className="text-xs text-gray-600">Upload PDFs and get instant insights</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="font-medium text-sm mb-1">🧠 Semantic Memory</div>
                    <div className="text-xs text-gray-600">AI remembers your medical history contextually</div>
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-12">Loading chat...</div>
          ) : (
            messages.map((m, idx) => {
              // File upload messages (shown as user messages)
              if (m.role === 'file') {
                return (
                  <div key={m.id || idx} className="flex justify-end">
                    <div className="max-w-[70%] bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        {/* File icon */}
                        <div className="text-3xl">
                          {m.fileData?.type === 'PDF' ? '📄' : 
                           m.fileData?.type === 'CSV' ? '📊' : '🖼️'}
                        </div>
                        
                        {/* File details */}
                        <div className="flex-1">
                          <div className="text-xs opacity-90 mb-1">
                            📁 Uploaded File
                          </div>
                          <div className="font-medium">
                            {m.fileData?.name || m.content}
                          </div>
                          <div className="text-xs opacity-80 mt-2 space-y-1">
                            <div>{m.fileData?.type} • {m.fileData?.size}</div>
                            {m.fileData?.pages && <div>{m.fileData.pages} pages</div>}
                            {m.fileData?.extractedData && (
                              <div className="mt-1.5 bg-white/20 px-2 py-1 rounded inline-block">
                                ✓ Text extracted
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs mt-2 opacity-70">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              }
              
              // System messages (notifications)
              if (m.role === 'system') {
                return (
                  <div key={m.id || idx} className="flex justify-center">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 max-w-[80%]">
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                );
              }
              
              // AI typing indicator
              if (m.content === 'typing') {
                return (
                  <div key={m.id || idx} className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Regular user/assistant messages
              return (
                <div key={m.id || idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    <div className={`text-xs mt-2 ${m.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto">
            {/* File input (hidden) */}
            <input 
              id={fileInputId} 
              type="file" 
              accept=".pdf,.csv,image/*" 
              onChange={handleFileSelect} 
              className="hidden" 
            />
            
            {/* File attachment preview */}
            {attachedFile && (
              <div className="mb-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📎</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{attachedFile.name}</div>
                    <div className="text-xs text-gray-600">{(attachedFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
                <button
                  onClick={removeAttachment}
                  className="text-gray-500 hover:text-red-600 p-1"
                  title="Remove attachment"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* Input bar */}
            <div className="flex gap-2 items-end">
              {/* Upload button */}
              <button
                onClick={() => document.getElementById(fileInputId)?.click()}
                disabled={sending}
                className={`p-3 border rounded-lg transition ${
                  attachedFile 
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-emerald-600'
                }`}
                title="Attach medical file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={attachedFile ? "Add a message about this file (optional)..." : "Type your message..."}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={sending}
              />
              
              {/* Send button */}
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !attachedFile) || sending}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {sending ? 'Sending...' : (attachedFile ? 'Upload & Send' : 'Send')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
