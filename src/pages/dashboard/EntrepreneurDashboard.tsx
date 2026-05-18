import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();

  // ✅ Backend states
  const [collaborationRequests, setCollaborationRequests] = useState<any[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch collaboration requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?._id) return;

      try {
        const response = await api.get('/collaborations/received');
        console.log('Collaboration requests:', response.data);
        setCollaborationRequests(response.data.requests || []);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      }
    };

    fetchRequests();
  }, [user]);

  // ✅ Fetch recommended investors from backend
  useEffect(() => {
    const fetchInvestors = async () => {
      if (!user?._id) return;

      try {
        const response = await api.get('/users/investors', {
          params: { limit: 3 }
        });
        console.log('Recommended investors:', response.data);
        setRecommendedInvestors(response.data.investors || []);
      } catch (error) {
        console.error('Failed to fetch investors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, [user]);

  // ✅ Handle accept/reject
  const handleRequestStatusUpdate = async (
    requestId: string,
    status: 'accepted' | 'rejected'
  ) => {
    setCollaborationRequests((prev) =>
      prev.map((req) =>
        req._id === requestId ? { ...req, status } : req
      )
    );
  };

  if (!user) return null;

  const pendingRequests = collaborationRequests.filter(
    (req) => req.status === 'pending'
  );
  const acceptedRequests = collaborationRequests.filter(
    (req) => req.status === 'accepted'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your startup today
          </p>
        </div>

        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />}>
            Find Investors
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">
                  Pending Requests
                </p>
                <h3 className="text-xl font-semibold text-primary-900">
                  {pendingRequests.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">
                  Total Connections
                </p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {acceptedRequests.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">
                  Upcoming Meetings
                </p>
                <h3 className="text-xl font-semibold text-accent-900">0</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">
                  Total Requests
                </p>
                <h3 className="text-xl font-semibold text-success-900">
                  {collaborationRequests.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Collaboration Requests
              </h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>

            <CardBody>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map((request) => (
                    <CollaborationRequestCard
                      key={request._id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    When investors are interested, requests will appear here
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recommended investors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Recommended Investors
              </h2>
              <Link
                to="/investors"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </CardHeader>

            <CardBody className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : recommendedInvestors.length > 0 ? (
                recommendedInvestors.map((investor) => (
                  <InvestorCard
                    key={investor._id}
                    investor={investor}
                    showActions={false}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No investors found
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};