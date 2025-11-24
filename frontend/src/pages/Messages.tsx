import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Loader2, Trash2 } from 'lucide-react';
import { getMyThreads, getThreadMessages, sendMessage, deleteMessage, deleteThread } from '../services/mockDatabase';
import { socketService } from '../services/socketService';
import { ChatThread, ChatMessage } from '../types';
import { getUser } from '../services/authService';

const Messages: React.FC = () => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();

  // Load threads on mount
  useEffect(() => {
    getMyThreads().then(t => {
      setThreads(t);
      if (t.length > 0) setActiveThreadId(t[0].id);
      setLoading(false);
    });

    // Connect to socket
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Load messages when thread changes
  useEffect(() => {
    if (activeThreadId) {
      // Load historical messages
      getThreadMessages(activeThreadId).then(setMessages);
      
      // Join thread room for real-time updates
      socketService.joinThread(activeThreadId);
    }

    // Leave previous thread room
    return () => {
      if (activeThreadId) {
        socketService.leaveThread(activeThreadId);
      }
    };
  }, [activeThreadId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      // Only add message if it's for the active thread
      if (newMessage.threadId === activeThreadId) {
        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some(m => m.id === newMessage.id);
          if (exists) return prev;
          
          // Set isMe based on current user
          const messageWithIsMe = {
            ...newMessage,
            isMe: newMessage.senderId === currentUser?.id
          };
          
          return [...prev, messageWithIsMe];
        });
      }

      // Update thread list with new last message
      setThreads(prev => prev.map(thread => {
        if (thread.id === newMessage.threadId) {
          return {
            ...thread,
            lastMessage: newMessage.text,
            lastMessageTime: new Date().toLocaleString()
          };
        }
        return thread;
      }));
    };

    socketService.onMessage(handleNewMessage);

    return () => {
      socketService.offMessage(handleNewMessage);
    };
  }, [activeThreadId, currentUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeThreadId || sending) return;

    const text = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      // Send via API (which also triggers socket to notify other users)
      const sentMessage = await sendMessage(activeThreadId, text);
      
      // Optimistically add message for immediate feedback
      // The socket event will update it with the real ID if needed
      setMessages(prev => {
        // Check if message already exists (from socket)
        const exists = prev.some(m => m.id === sentMessage.id);
        if (exists) return prev;
        return [...prev, sentMessage];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input value on error
      setInputValue(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setDeletingMessageId(messageId);
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error: any) {
      alert(error.message || 'Failed to delete message');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleDeleteThread = async (threadId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent thread selection
    
    if (!confirm('Are you sure you want to delete this entire conversation? All messages will be permanently deleted. This action cannot be undone.')) {
      return;
    }

    setDeletingThreadId(threadId);
    try {
      await deleteThread(threadId);
      // Remove thread from list
      setThreads(prev => prev.filter(t => t.id !== threadId));
      // If deleted thread was active, clear it
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete conversation');
    } finally {
      setDeletingThreadId(null);
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[calc(100vh-140px)] flex overflow-hidden">
      {/* Chat List */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads
            .filter(thread => {
              if (!searchTerm.trim()) return true;
              const search = searchTerm.toLowerCase();
              return (
                thread.partnerName.toLowerCase().includes(search) ||
                thread.taskTitle.toLowerCase().includes(search) ||
                thread.lastMessage.toLowerCase().includes(search)
              );
            })
            .map((thread, index) => (
            <div 
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`p-4 flex items-start space-x-3 cursor-pointer transition-colors group relative ${activeThreadId === thread.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {thread.partnerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">{thread.partnerName}</h4>
                  <span className="text-xs text-gray-400">{thread.lastMessageTime}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{thread.taskTitle}</p>
                <p className="text-sm text-gray-600 truncate">{thread.lastMessage}</p>
              </div>
              <div className="flex items-center space-x-2">
                {thread.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
                  </div>
                )}
                <button
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  disabled={deletingThreadId === thread.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  title="Delete conversation"
                >
                  {deletingThreadId === thread.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
            ))}
          {threads.filter(thread => {
            if (!searchTerm.trim()) return true;
            const search = searchTerm.toLowerCase();
            return (
              thread.partnerName.toLowerCase().includes(search) ||
              thread.taskTitle.toLowerCase().includes(search) ||
              thread.lastMessage.toLowerCase().includes(search)
            );
          }).length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">
              {searchTerm.trim() ? 'No conversations found' : 'No messages yet'}
            </div>
          )}
        </div>
      </div>

      {/* Active Chat */}
      {activeThread ? (
        <div className="hidden md:flex flex-1 flex-col bg-gray-50/50">
          {/* Chat Header */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {activeThread.partnerName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{activeThread.partnerName}</h3>
                <p className="text-xs text-gray-500">{activeThread.taskTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="relative">
                <Search className="absolute left-2 top-2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  value={messageSearchTerm}
                  onChange={(e) => setMessageSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => activeThreadId && handleDeleteThread(activeThreadId, {} as React.MouseEvent)}
                disabled={!activeThreadId || deletingThreadId === activeThreadId}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete entire conversation"
              >
                {deletingThreadId === activeThreadId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} className="mr-1" />
                    Delete Conversation
                  </>
                )}
              </button>
              <Phone size={20} className="hover:text-gray-800 cursor-pointer" />
              <Video size={20} className="hover:text-gray-800 cursor-pointer" />
              <MoreVertical size={20} className="hover:text-gray-800 cursor-pointer" />
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages
                .filter(msg => {
                  if (!messageSearchTerm.trim()) return true;
                  const search = messageSearchTerm.toLowerCase();
                  return msg.text.toLowerCase().includes(search) || 
                         msg.senderName.toLowerCase().includes(search);
                })
                .map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 relative ${
                    msg.isMe
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white border border-gray-100 shadow-sm rounded-bl-none'
                  }`}>
                    {msg.isMe && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        disabled={deletingMessageId === msg.id}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                        title="Delete message"
                      >
                        {deletingMessageId === msg.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    )}
                    {!msg.isMe && (
                      <p className="text-xs font-semibold mb-1 text-gray-700">{msg.senderName}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {messageSearchTerm.trim() ? (
                        msg.text.split(new RegExp(`(${messageSearchTerm})`, 'gi')).map((part, i) => 
                          part.toLowerCase() === messageSearchTerm.toLowerCase() ? (
                            <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )
                      ) : (
                        msg.text
                      )}
                    </p>
                    <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-2 bg-white border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 ring-offset-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip size={20} />
              </button>
              <textarea 
                className="flex-1 max-h-32 py-2 bg-transparent border-none focus:ring-0 resize-none text-sm scrollbar-hide"
                placeholder="Type your message..."
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sending}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <p className="text-gray-400">Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Messages;
