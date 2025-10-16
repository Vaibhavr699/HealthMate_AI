"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HistoryPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [files, setFiles] = useState([]);
  const [chats, setChats] = useState([]);
  const [view, setView] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else {
      fetchData();
    }
  }, [user, router]);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };

  async function fetchData() {
    try {
      setLoading(true);
      
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);

      const filesRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, { headers });
      const filesData = await filesRes.json();
      if (filesRes.ok) setFiles(filesData.files || []);

      const chatsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, { headers });
      const chatsData = await chatsRes.json();
      if (chatsRes.ok) setChats(chatsData.chats || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportAllChats() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/export/all`, { headers });
      const data = await res.json();
      
      if (!res.ok) throw new Error('Export failed');

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healthmate-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Chat history exported successfully!');
    } catch (error) {
      alert('Failed to export: ' + error.message);
    }
  }

  async function exportChat(chatId) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/export/${chatId}`, { headers });
      const data = await res.json();
      
      if (!res.ok) throw new Error('Export failed');

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${chatId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Chat exported successfully!');
    } catch (error) {
      alert('Failed to export: ' + error.message);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your health history..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Enhanced Glass Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        {/* Subtle geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-slate-300 rounded-lg rotate-12"></div>
          <div className="absolute bottom-40 right-32 w-32 h-32 border-2 border-slate-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-slate-300 rotate-45"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Premium Glass Header */}
        <div className="backdrop-blur-2xl bg-white/70 border-b border-slate-200/80 shadow-sm sticky top-0 z-50">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link 
                  href="/dashboard"
                  className="group flex items-center gap-3 text-slate-700 hover:text-slate-900 transition-all duration-300"
                >
                  <span className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300 group-hover:-translate-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </span>
                  <span className="font-semibold text-slate-700">Dashboard</span>
                </Link>
                <div className="h-8 w-px bg-slate-300/80"></div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Health Analytics Hub
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="backdrop-blur-sm bg-white/80 px-4 py-2 rounded-xl text-sm text-slate-700 border border-slate-200 font-medium shadow-sm">
                  {user?.name || user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Glass Navigation */}
        <div className="backdrop-blur-2xl bg-white/60 border-b border-slate-200/60 sticky top-16 z-40">
          <div className="max-w-7full mx-auto px-6">
            <div className="flex gap-1 py-2">
              {[
                { id: 'overview', icon: '📊', label: 'Overview', count: null },
                { id: 'chats', icon: '💬', label: 'Conversations', count: chats.length },
                { id: 'files', icon: '📄', label: 'Medical Files', count: files.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`relative py-3 px-6 font-semibold text-sm transition-all duration-300 group rounded-xl mx-1 ${
                    view === tab.id
                      ? 'text-slate-800 bg-white/80 shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-bold min-w-6 ${
                        view === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-full mx-auto px-6 py-8">
          {view === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: 'Total Conversations', 
                    value: stats?.statistics?.totalChats || 0, 
                    icon: '💬',
                    bgColor: 'bg-blue-50',
                    iconColor: 'text-blue-600',
                    borderColor: 'border-blue-200',
                    delay: '0s' 
                  },
                  { 
                    label: 'Messages Sent', 
                    value: stats?.statistics?.totalMessages || 0, 
                    icon: '✉️',
                    bgColor: 'bg-emerald-50',
                    iconColor: 'text-emerald-600',
                    borderColor: 'border-emerald-200',
                    delay: '0.1s' 
                  },
                  { 
                    label: 'Medical Files', 
                    value: stats?.statistics?.totalFiles || 0, 
                    icon: '📋',
                    bgColor: 'bg-purple-50',
                    iconColor: 'text-purple-600',
                    borderColor: 'border-purple-200',
                    delay: '0.2s' 
                  },
                  { 
                    label: 'Member Since', 
                    value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
                    icon: '🎯',
                    bgColor: 'bg-amber-50',
                    iconColor: 'text-amber-600',
                    borderColor: 'border-amber-200',
                    delay: '0.3s',
                    isDate: true 
                  }
                ].map((stat, idx) => (
                  <div 
                    key={idx}
                    className="group relative"
                    style={{ animationDelay: stat.delay }}
                  >
                    <div className={`relative backdrop-blur-sm ${stat.bgColor} rounded-2xl p-6 border-2 ${stat.borderColor} transition-all duration-500 hover:shadow-lg hover:scale-105`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} border-2 ${stat.borderColor} flex items-center justify-center text-2xl ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="text-slate-600 text-sm font-medium mb-2">{stat.label}</div>
                      <div className={`font-bold text-slate-800 ${stat.isDate ? 'text-xl' : 'text-3xl'} group-hover:scale-105 transition-transform duration-300`}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Activity Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Conversations */}
                <div className="lg:col-span-2">
                  <div className="backdrop-blur-sm bg-white/80 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm h-full transition-all duration-300 hover:shadow-md">
                    <div className="bg-white border-b border-slate-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 mb-1">Recent Conversations</h2>
                          <p className="text-slate-600 text-sm">Your latest chat interactions</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600">
                          💬
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto custom-scrollbar">
                      {stats?.recentActivity?.chats?.length > 0 ? (
                        stats.recentActivity.chats.map((chat, idx) => (
                          <div 
                            key={chat.id} 
                            className="p-5 hover:bg-slate-50/80 transition-all duration-300 cursor-pointer group"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-lg text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                💭
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                  {chat.title}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                                  </svg>
                                  {new Date(chat.updatedAt).toLocaleString()}
                                </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                  →
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <div className="text-4xl mb-3 opacity-30">💬</div>
                          <div className="text-slate-500 text-sm">No conversations yet</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Uploads */}
                <div className="lg:col-span-1">
                  <div className="backdrop-blur-sm bg-white/80 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm h-full transition-all duration-300 hover:shadow-md">
                    <div className="bg-white border-b border-slate-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 mb-1">Recent Files</h2>
                          <p className="text-slate-600 text-sm">Latest uploads</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600">
                          📁
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto custom-scrollbar">
                      {stats?.recentActivity?.files?.length > 0 ? (
                        stats.recentActivity.files.map((file, idx) => (
                          <div 
                            key={file.id} 
                            className="p-4 hover:bg-slate-50/80 transition-all duration-300 cursor-pointer group"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-2xl text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                                {file.fileType === 'application/pdf' ? '📄' : '📊'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-800 text-sm truncate">
                                  {file.originalName}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <div className="text-4xl mb-3 opacity-30">📁</div>
                          <div className="text-slate-500 text-sm">No files yet</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'chats' && (
            <div className="backdrop-blur-sm bg-white/80 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm animate-fadeIn transition-all duration-300 hover:shadow-md">
              <div className="bg-white border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Conversation Archive</h2>
                    <p className="text-slate-600 text-sm">Browse and export your complete chat history</p>
                  </div>
                  <button
                    onClick={exportAllChats}
                    className="group relative overflow-hidden px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export All</span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-200 max-h-[700px] overflow-y-auto custom-scrollbar">
                {chats.length > 0 ? (
                  chats.map((chat, idx) => (
                    <div 
                      key={chat.id} 
                      className="p-6 hover:bg-slate-50/80 transition-all duration-300 group"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                          💬
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                            {chat.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Created {new Date(chat.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                              </svg>
                              <span>Updated {new Date(chat.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => exportChat(chat.id)}
                            className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export
                          </button>
                          <Link
                            href="/dashboard"
                            onClick={() => {
                              localStorage.setItem('loadChatId', chat.id);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-900 transition-all duration-300 hover:scale-105 shadow-sm text-sm flex items-center gap-2"
                          >
                            <span>Open</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <div className="text-6xl mb-4 opacity-20">💬</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No conversations yet</h3>
                    <p className="text-slate-600 text-sm">Start chatting to build your history!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'files' && (
            <div className="backdrop-blur-sm bg-white/80 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm animate-fadeIn transition-all duration-300 hover:shadow-md">
              <div className="bg-white border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Medical Document Library</h2>
                    <p className="text-slate-600 text-sm">All your uploaded health records and reports</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-2xl text-emerald-600">
                    📚
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-200 max-h-[700px] overflow-y-auto custom-scrollbar">
                {files.length > 0 ? (
                  files.map((file, idx) => (
                    <div 
                      key={file.id} 
                      className="p-6 hover:bg-slate-50/80 transition-all duration-300 group"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-3xl text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {file.fileType === 'application/pdf' ? '📄' :
                           file.fileType === 'text/csv' ? '📊' : '🖼️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-lg mb-2 truncate group-hover:text-emerald-700 transition-colors">
                            {file.originalName}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              <span>{(file.fileSize / 1024).toFixed(2)} KB</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>{file.fileType.split('/')[1].toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {file.extractedData && (
                            <button
                              onClick={() => {
                                alert(`Extracted Data:\n\n${JSON.stringify(file.extractedData, null, 2).substring(0, 500)}...`);
                              }}
                              className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Data
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <div className="text-6xl mb-4 opacity-20">📁</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No files uploaded yet</h3>
                    <p className="text-slate-600 text-sm">Upload medical documents to get started!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}