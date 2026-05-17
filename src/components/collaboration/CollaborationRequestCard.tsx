import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle } from 'lucide-react';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';

interface CollaborationRequestCardProps {
  request: any;
  onStatusUpdate?: (requestId: string, status: 'accepted' | 'rejected') => void;
}

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

export const CollaborationRequestCard: React.FC<CollaborationRequestCardProps> = ({
  request,
  onStatusUpdate
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(request.status);

  // ✅ FIXED: Get investor from populated data (not dummy findUserById)
  const investor = request.investorId;

  // If investorId wasn't populated (it's just a string), skip rendering
  if (!investor || typeof investor === 'string') {
    console.warn('Investor data not populated for request:', request._id);
    return null;
  }

  // ✅ FIXED: Use backend API to accept request
  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post(`/collaborations/${request._id}/respond`, {
        action: 'accepted'
      });
      setCurrentStatus('accepted');
      if (onStatusUpdate) {
        onStatusUpdate(request._id, 'accepted');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use backend API to reject request
  const handleReject = async () => {
    setLoading(true);
    try {
      await api.post(`/collaborations/${request._id}/respond`, {
        action: 'rejected'
      });
      setCurrentStatus('rejected');
      if (onStatusUpdate) {
        onStatusUpdate(request._id, 'rejected');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/chat/${investor._id}`);
  };

  const handleViewProfile = () => {
    navigate(`/profile/investor/${investor._id}`);
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Declined</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="transition-all duration-300">
      <CardBody className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <Avatar
              src={investor.avatarUrl || investor.profilePic || ''}
              alt={investor.name || 'Investor'}
              size="md"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mr-3"
            />

            <div>
              <h3 className="text-md font-semibold text-gray-900">
                {investor.name || 'Unknown Investor'}
              </h3>
              <p className="text-sm text-gray-500">
                {investor.role && (
                  <span className="capitalize">{investor.role} • </span>
                )}
                {formatTime(request.createdAt)}
              </p>
            </div>
          </div>

          {getStatusBadge()}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">{request.message}</p>
        </div>
      </CardBody>

      <CardFooter className="border-t border-gray-100 bg-gray-50">
        {currentStatus === 'pending' ? (
          <div className="flex justify-between w-full">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<X size={16} />}
                onClick={handleReject}
                disabled={loading}
              >
                Decline
              </Button>
              <Button
                variant="success"
                size="sm"
                leftIcon={<Check size={16} />}
                onClick={handleAccept}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Accept'}
              </Button>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>
          </div>
        ) : (
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageCircle size={16} />}
              onClick={handleMessage}
            >
              Message
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};