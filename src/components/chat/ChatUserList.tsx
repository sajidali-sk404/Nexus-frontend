import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Check, CheckCheck, MessageCircle } from 'lucide-react';

interface ChatUserListProps {
  conversations: any[];
}

const formatTime = (dateValue: string | Date | undefined | null): string => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: false });
  } catch {
    return '';
  }
};

export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations }) => {
  const navigate = useNavigate();
  const { userId: activeUserId } = useParams();
  const { user: currentUser } = useAuth();

  if (!currentUser) return null;

  // ✅ Navigate using partner's userId
  const handleSelectUser = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="bg-white w-full h-full overflow-y-auto">
        <div className="py-4">
          <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">Messages</h2>
          <div className="px-4 py-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
              <MessageCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No conversations yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full h-full overflow-y-auto">
      <div className="py-4">
        <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">Messages</h2>

        <div className="space-y-1">
          {conversations.map((conversation, index) => {
            // ✅ Your backend returns "partner" field
            const otherUser = conversation.partner;

            if (!otherUser) return null;

            const otherUserId = otherUser._id || otherUser.id;

            // ✅ lastMessage is the full message object from backend
            const lastMessage = conversation.lastMessage;
            const isActive = activeUserId === otherUserId;

            // ✅ Check if last message sender is current user
            const lastMessageSenderId = typeof lastMessage?.senderId === 'object'
              ? lastMessage?.senderId?._id?.toString()
              : lastMessage?.senderId?.toString();

            const isOwnMessage = lastMessageSenderId === currentUser._id;

            // ✅ Use isRead from your Message model
            const isRead = lastMessage?.isRead ?? false;
            const unreadCount = conversation.unreadCount || 0;

            // ✅ Get time from lastMessage
            const messageTime = lastMessage?.createdAt
              || lastMessage?.timestamp
              || conversation.updatedAt;

            return (
              <div
                key={conversation.id || conversation._id || `conv-${index}`}
                className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 border-l-4 border-primary-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
                onClick={() => handleSelectUser(otherUserId)}
              >
                <Avatar
                  src={otherUser.avatarUrl || otherUser.profilePic || ''}
                  alt={otherUser.name || 'User'}
                  size="md"
                  status={otherUser.isOnline || otherUser.isActive ? 'online' : 'offline'}
                  className="mr-3 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {otherUser.name || 'Unknown'}
                    </h3>
                    {messageTime && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(messageTime)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center flex-1 min-w-0">
                      {/* Seen/Unseen tick for own messages */}
                      {lastMessage && isOwnMessage && (
                        <span className="mr-1 flex-shrink-0">
                          {isRead ? (
                            <span title="Seen">
                              <CheckCheck size={14} className="text-blue-500" />
                            </span>
                          ) : (
                            <span title="Sent">
                              <Check size={14} className="text-gray-400" />
                            </span>
                          )}
                        </span>
                      )}

                      {lastMessage ? (
                        <p className={`text-xs truncate ${
                          !isOwnMessage && !isRead
                            ? 'text-gray-900 font-semibold'
                            : 'text-gray-600'
                        }`}>
                          {isOwnMessage ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          No messages yet
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {!isOwnMessage && unreadCount > 0 && (
                      <Badge variant="primary" size="sm" rounded className="ml-2">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};