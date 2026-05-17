// pages/collaborations/CollaborationRequestsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import api from '../../lib/api';

export const CollaborationRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?._id) return;

      try {
        let endpoint = '';

        if (user.role === 'entrepreneur') {
          // ✅ Entrepreneur sees received requests
          endpoint = '/collaborations/received';
        } else {
          // ✅ Investor sees sent requests
          endpoint = '/collaborations/get-sent-requests';
        }

        // Add status filter if not "all"
        const params = filter !== 'all' ? `?status=${filter}` : '';
        const response = await api.get(`${endpoint}${params}`);

        console.log('Collaboration requests:', response.data);
        setRequests(response.data.requests || []);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, filter]);

  const handleStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setRequests((prev) =>
      prev.map((req) =>
        req._id === requestId ? { ...req, status } : req
      )
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {user.role === 'entrepreneur' ? 'Collaboration Requests' : 'Sent Requests'}
        </h1>

        {/* Filter buttons */}
        <div className="flex space-x-2">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <CollaborationRequestCard
              key={request._id}
              request={request}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700">
            No {filter !== 'all' ? filter : ''} requests
          </h3>
          <p className="text-gray-500 mt-1">
            {user.role === 'entrepreneur'
              ? 'No investors have sent you collaboration requests yet.'
              : 'You haven\'t sent any collaboration requests yet.'}
          </p>
        </div>
      )}
    </div>
  );
};