import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Send, Phone, Video, Info, Smile, MessageCircle
} from 'lucide-react';

import api from '../../lib/api';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, User } from '../../types';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getSenderId = (msg: Message): string => {
    if (typeof msg.senderId === 'string') return msg.senderId;
    return (msg.senderId as User)._id;
  };

  // ==========================
  // 1. FETCH CHAT PARTNER
  // ==========================
  useEffect(() => {
    const fetchChatPartner = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`/users/${userId}`);
        setChatPartner(response.data.user);
      } catch (error) {
        console.error('Failed to fetch chat partner', error);
      }
    };
    fetchChatPartner();
  }, [userId]);

  // ==========================
  // 2. FETCH CONVERSATIONS
  // ==========================
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser?._id) return;
      try {
        const response = await api.get('/messages/conversations');
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [currentUser]);

  // ==========================
  // 3. FETCH MESSAGES - SIMPLIFIED!
  // ==========================
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) return;

      try {
        // ✅ FIXED: Just use userId directly!
        // Backend route: GET /api/messages/:userId
        console.log('Fetching messages with user:', userId);

        const response = await api.get(`/messages/${userId}`);

        const msgs = response.data.messages || [];
        console.log('Fetched messages:', msgs.length);

        setMessages(msgs);
      } catch (error) {
        console.error('Failed to fetch messages', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [userId]);

  // ==========================
  // 4. AUTO SCROLL
  // ==========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================
  // 5. SEND MESSAGE
  // ==========================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !userId) return;

    try {
      const response = await api.post('/messages/send', {
        receiverId: userId,
        content: newMessage
      });

      console.log('Message sent:', response.data);

      const sentMessage = response.data.message;
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');

      // ✅ Refresh conversations to update sidebar
      const convoResponse = await api.get('/messages/conversations');
      setConversations(convoResponse.data.conversations || []);

    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in">

      {/* Sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200">
        <ChatUserList conversations={conversations} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatPartner ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {chatPartner.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {chatPartner.isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="rounded-full p-2">
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2">
                  <Video size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2">
                  <Info size={18} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message._id || `msg-${index}`}
                      message={message}
                      isCurrentUser={getSenderId(message) === currentUser._id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2">
                  <Smile size={20} />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageCircle size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
            <p className="text-gray-500 mt-2 text-center">
              Choose a contact to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};