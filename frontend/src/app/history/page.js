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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Chat
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Health History & Analytics</h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.name || user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setView('overview')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition ${
                view === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setView('chats')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition ${
                view === 'chats'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💬 Chat History ({chats.length})
            </button>
            <button
              onClick={() => setView('files')}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition ${
                view === 'files'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 Medical Files ({files.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm mb-1">Total Conversations</div>
                <div className="text-3xl font-bold text-indigo-600">
                  {stats?.statistics?.totalChats || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm mb-1">Messages Sent</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.statistics?.totalMessages || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm mb-1">Medical Files</div>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.statistics?.totalFiles || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm mb-1">Member Since</div>
                <div className="text-lg font-semibold text-gray-700">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Chats */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-900">Recent Conversations</h2>
                </div>
                <div className="divide-y max-h-80 overflow-y-auto">
                  {stats?.recentActivity?.chats?.length > 0 ? (
                    stats.recentActivity.chats.map((chat) => (
                      <div key={chat.id} className="p-4 hover:bg-gray-50">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(chat.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No conversations yet
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Files */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-900">Recent Uploads</h2>
                </div>
                <div className="divide-y max-h-80 overflow-y-auto">
                  {stats?.recentActivity?.files?.length > 0 ? (
                    stats.recentActivity.files.map((file) => (
                      <div key={file.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {file.fileType === 'application/pdf' ? '📄' : '📊'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {file.originalName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(file.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No files uploaded yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Categories */}
            {stats?.statistics?.filesByCategory?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Files by Category</h2>
                <div className="space-y-3">
                  {stats.statistics.filesByCategory.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 capitalize">{cat.category}</div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(cat.count / stats.statistics.totalFiles) * 100}%`
                            }}
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-900 w-8 text-right">
                          {cat.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'chats' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">All Conversations</h2>
              <button
                onClick={exportAllChats}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                📥 Export All
              </button>
            </div>
            <div className="divide-y">
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div key={chat.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{chat.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Created: {new Date(chat.createdAt).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last updated: {new Date(chat.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => exportChat(chat.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 border border-indigo-600 rounded"
                        >
                          Export
                        </button>
                        <Link
                          href="/dashboard"
                          onClick={() => {
                            // Store chat ID in localStorage to auto-load it
                            localStorage.setItem('loadChatId', chat.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 border border-indigo-600 rounded"
                        >
                          Open →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No conversations yet. Start chatting to build your history!
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'files' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">All Medical Files</h2>
            </div>
            <div className="divide-y">
              {files.length > 0 ? (
                files.map((file) => (
                  <div key={file.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {file.fileType === 'application/pdf' ? '📄' :
                         file.fileType === 'text/csv' ? '📊' : '🖼️'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{file.originalName}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {(file.fileSize / 1024).toFixed(2)} KB • {file.fileType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Uploaded: {new Date(file.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {file.extractedData && (
                          <button
                            onClick={() => {
                              // Show extracted data in modal or alert
                              alert(`Extracted Data:\n\n${JSON.stringify(file.extractedData, null, 2).substring(0, 500)}...`);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1 border border-indigo-600 rounded"
                          >
                            View Data
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No files uploaded yet. Upload medical documents to get started!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

