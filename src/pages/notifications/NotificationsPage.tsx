import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageCircle, UserPlus, DollarSign, Trash2, CheckCheck } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';

// ✅ Safe date formatter
const formatTime = (dateValue: string | Date | undefined | null): string => {
  if (!dateValue) return 'recently';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
};

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // ✅ Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);

        const params: any = { limit: 50 };
        if (filter === 'unread') {
          params.unreadOnly = 'true';
        }

        const response = await api.get('/notifications', { params });

        console.log('Notifications:', response.data);

        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, filter]);

  // ✅ Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'deal':
        return <DollarSign size={16} className="text-success-600" />;
      case 'connection':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'investment':
        return <DollarSign size={16} className="text-accent-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  // ✅ Handle notification click - Mark as read AND navigate
 // ✅ Handle notification click - Mark as read AND navigate
const handleNotificationClick = async (notification: any) => {
  try {
    // 1. Mark as read if unread
    if (!notification.isRead) {
      await api.put(`/notifications/${notification._id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    // 2. Navigate based on notification type and refModel
    const fromUserId = typeof notification.fromUserId === 'object'
      ? notification.fromUserId._id
      : notification.fromUserId;

    const fromUserRole = typeof notification.fromUserId === 'object'
      ? notification.fromUserId.role
      : 'entrepreneur';

    switch (notification.type) {
      case 'message':
        navigate(`/chat/${fromUserId}`);
        break;

      case 'investment':
        // ✅ Check if it's a Deal notification
        if (notification.refModel === 'Deal') {
          // Navigate to deals page with the specific deal
          navigate(`/deals?dealId=${notification.refId}`);
          break;
        }

        // If it's a CollaborationRequest
        if (notification.refModel === 'CollaborationRequest') {
          if (user?.role === 'entrepreneur') {
            navigate('/collaboration-requests');
          } else {
            navigate(`/profile/entrepreneur/${fromUserId}`);
          }
          break;
        }

        // Default for investment type
        navigate(`/profile/${fromUserRole}/${fromUserId}`);
        break;

      case 'connection':
        if (notification.refModel === 'CollaborationRequest') {
          if (user?.role === 'entrepreneur') {
            navigate('/collaboration-requests');
          } else {
            navigate(`/profile/entrepreneur/${fromUserId}`);
          }
        } else {
          navigate(`/profile/${fromUserRole}/${fromUserId}`);
        }
        break;

      default:
        if (fromUserId) {
          navigate(`/profile/${fromUserRole}/${fromUserId}`);
        }
        break;
    }
  } catch (error) {
    console.error('Failed to handle notification:', error);
  }
};

  // ✅ Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // ✅ Delete single notification
  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent triggering the click handler

    try {
      await api.delete(`/notifications/${notificationId}`);

      setNotifications((prev) => {
        const deleted = prev.find((n) => n._id === notificationId);
        if (deleted && !deleted.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n._id !== notificationId);
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // ✅ Clear all notifications
  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your network activity
            {unreadCount > 0 && (
              <span className="ml-2">
                <Badge variant="primary" size="sm" rounded>
                  {unreadCount} new
                </Badge>
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck size={16} />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={handleClearAll}
              className="text-red-600 hover:bg-red-50"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm rounded-full ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm rounded-full ${
            filter === 'unread'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => {
            // ✅ Get the "from" user data (populated from backend)
            const fromUser = typeof notification.fromUserId === 'object'
              ? notification.fromUserId
              : null;

            return (
              <Card
                key={notification._id}
                className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                  !notification.isRead
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : 'border-l-4 border-transparent hover:bg-gray-50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardBody className="flex items-start p-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mr-4">
                    <Avatar
                      src={fromUser?.profilePic || fromUser?.avatarUrl || ''}
                      alt={fromUser?.name || 'User'}
                      size="md"
                    />
                    {/* Type icon overlay */}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {fromUser?.name || 'Someone'}
                      </span>

                      {!notification.isRead && (
                        <Badge variant="primary" size="sm" rounded>
                          New
                        </Badge>
                      )}
                    </div>

                    <p className={`mt-1 text-sm ${
                      !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.content}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      {getNotificationIcon(notification.type)}
                      <span>{formatTime(notification.createdAt)}</span>
                      <span className="capitalize">• {notification.type}</span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                    className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </CardBody>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 mt-1">
              {filter === 'unread'
                ? 'You\'re all caught up!'
                : 'When you receive messages or requests, they\'ll appear here'}
            </p>
            {filter === 'unread' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setFilter('all')}
              >
                View all notifications
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};