import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

function isUser(value: unknown): value is User {
  return (
    value !== null &&
    typeof value === 'object' &&
    'name' in value
  );
}

const formatMessageTime = (dateValue: string | Date | undefined | null): string => {
  if (!dateValue) return 'just now';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'just now';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'just now';
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
}) => {
  const sender = isUser(message.senderId) ? message.senderId : null;

  // ✅ Use createdAt (from timestamps: true in model)
  const timeAgo = formatMessageTime(message.createdAt || message.timestamp);

  // ✅ Use isRead from your backend
  const isRead = (message as any).isRead ?? false;

  return (
    <div
      className={`flex ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } mb-4 animate-fade-in`}
    >
      {!isCurrentUser && sender && (
        <Avatar
          src={sender.avatarUrl || (sender as any).profilePic || ''}
          alt={sender.name || 'User'}
          size="sm"
          className="mr-2 self-end"
        />
      )}

      <div
        className={`flex flex-col ${
          isCurrentUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>

        <div className="flex items-center mt-1 space-x-1">
          <span className="text-xs text-gray-500">{timeAgo}</span>

          {/* ✅ Seen/Unseen for sent messages */}
          {isCurrentUser && (
            <span className="flex items-center">
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
        </div>
      </div>

      {isCurrentUser && sender && (
        <Avatar
          src={sender.avatarUrl || (sender as any).profilePic || ''}
          alt={sender.name || 'User'}
          size="sm"
          className="ml-2 self-end"
        />
      )}
    </div>
  );
};