import React, { useState, useEffect } from 'react';
import {
  DollarSign, Plus, Filter, TrendingUp, Clock,
  CheckCircle, XCircle, Search, BarChart3
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { AddDealModal } from '../../components/deals/AddDealModal';
import { DealDetailModal } from '../../components/deals/DealDetailModal';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';
import { useSearchParams } from 'react-router-dom';

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

// ✅ Format currency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (!amount) return '$0';
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
};

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [deals, setDeals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);


  // ✅ Auto-open deal from notification
  useEffect(() => {
    const dealIdFromNotification = searchParams.get('dealId');

    if (dealIdFromNotification && deals.length > 0) {
      const deal = deals.find((d) => d._id === dealIdFromNotification);
      if (deal) {
        setSelectedDeal(deal);
      } else {
        // Fetch specific deal if not in current list
        fetchDealById(dealIdFromNotification);
      }
    }
  }, [searchParams, deals]);

  // ✅ Fetch single deal by ID
  const fetchDealById = async (dealId: string) => {
    try {
      const response = await api.get(`/deals/${dealId}`);
      if (response.data.deal) {
        setSelectedDeal(response.data.deal);
      }
    } catch (error) {
      console.error('Failed to fetch deal:', error);
    }
  };

  // ✅ Fetch deals
  useEffect(() => {
    fetchDeals();
  }, [user, filter]);

  const fetchDeals = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      const params: any = { limit: 50 };
      if (filter !== 'all') params.status = filter;

      const response = await api.get('/deals', { params });

      console.log('Deals response:', response.data);

      setDeals(response.data.deals || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle deal added
  const handleDealAdded = (newDeal: any) => {
    setDeals((prev) => [newDeal, ...prev]);
    setShowAddModal(false);
    fetchDeals(); // Refresh stats
  };

  // ✅ Handle status update
  const handleStatusUpdate = async (dealId: string, status: string) => {
    try {
      const response = await api.put(`/deals/${dealId}/status`, { status });

      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? response.data.deal : d))
      );
    } catch (error) {
      console.error('Failed to update deal status:', error);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      await api.delete(`/deals/${dealId}`);
      setDeals((prev) => prev.filter((d) => d._id !== dealId));
    } catch (error) {
      console.error('Failed to delete deal:', error);
      alert('Cannot delete this deal. Only draft/cancelled deals can be deleted.');
    }
  };

  // ✅ Filter deals by search
  const filteredDeals = deals.filter((deal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      deal.title?.toLowerCase().includes(query) ||
      deal.startupName?.toLowerCase().includes(query) ||
      deal.industry?.toLowerCase().includes(query) ||
      deal.description?.toLowerCase().includes(query)
    );
  });

  // ✅ Status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'gray', label: 'Draft' },
      proposed: { variant: 'warning', label: 'Proposed' },
      negotiating: { variant: 'primary', label: 'Negotiating' },
      accepted: { variant: 'success', label: 'Accepted' },
      rejected: { variant: 'error', label: 'Rejected' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'gray', label: 'Cancelled' },
    };

    const config = variants[status] || { variant: 'gray', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // ✅ Get other party (investor sees entrepreneur, vice versa)
  const getOtherParty = (deal: any) => {
    if (user?.role === 'investor') {
      return typeof deal.entrepreneurId === 'object' ? deal.entrepreneurId : null;
    }
    return typeof deal.investorId === 'object' ? deal.investorId : null;
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600">Manage your investment deals and proposals</p>
        </div>

        {user.role === "investor" && (
          <Button leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
            Add Deal
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <BarChart3 size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Total Deals</p>
                <h3 className="text-xl font-semibold text-primary-900">
                  {stats.total || 0}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-yellow-50 border border-yellow-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <Clock size={20} className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">In Progress</p>
                <h3 className="text-xl font-semibold text-yellow-900">
                  {(stats.proposed || 0) + (stats.negotiating || 0)}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-green-50 border border-green-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <CheckCircle size={20} className="text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <h3 className="text-xl font-semibold text-green-900">
                  {stats.completed || 0}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <DollarSign size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Total Value</p>
                <h3 className="text-xl font-semibold text-accent-900">
                  {formatCurrency(stats.totalValue || 0)}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'proposed', 'negotiating', 'accepted', 'completed', 'rejected'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-full capitalize ${filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Deals List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Deals
          </h2>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredDeals.length > 0 ? (
            <div className="space-y-4">
              {filteredDeals.map((deal) => {
                const otherParty = getOtherParty(deal);

                return (
                  <div
                    key={deal._id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    {/* Other party avatar */}
                    <Avatar
                      src={otherParty?.avatarUrl || otherParty?.profilePic || ''}
                      alt={otherParty?.name || 'User'}
                      size="md"
                      className="mr-4 flex-shrink-0"
                    />

                    {/* Deal info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {deal.title}
                        </h3>
                        {getStatusBadge(deal.status)}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{otherParty?.name || 'Unknown'}</span>
                        {deal.startupName && (
                          <>
                            <span>•</span>
                            <span>{deal.startupName}</span>
                          </>
                        )}
                        {deal.industry && (
                          <>
                            <span>•</span>
                            <span>{deal.industry}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{formatTime(deal.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize">{deal.dealType}</span>
                        {deal.stage && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{deal.stage}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(deal.amount, deal.currency)}
                      </p>
                      {deal.equity > 0 && (
                        <p className="text-xs text-gray-500">{deal.equity}% equity</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>

                      {/* ── PROPOSED: Entrepreneur can Accept, Negotiate, Reject ── */}
                      {deal.status === 'proposed' && user?.role === 'entrepreneur' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStatusUpdate(deal._id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(deal._id, 'negotiating')}
                          >
                            Negotiate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleStatusUpdate(deal._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {/* ── PROPOSED: Investor can Cancel ── */}
                      {deal.status === 'proposed' && user?.role === 'investor' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleStatusUpdate(deal._id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      )}

                      {/* ── NEGOTIATING: Both can Accept, Reject, Cancel ── */}
                      {deal.status === 'negotiating' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStatusUpdate(deal._id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleStatusUpdate(deal._id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500"
                            onClick={() => handleStatusUpdate(deal._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* ── ACCEPTED: Both can Complete or Cancel ── */}
                      {deal.status === 'accepted' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(deal._id, 'completed')}
                          >
                            Complete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleStatusUpdate(deal._id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {/* ── REJECTED/CANCELLED: Investor can Re-propose, Anyone can Delete ── */}
                      {['rejected', 'cancelled'].includes(deal.status) && (
                        <>
                          {user?.role === 'investor' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(deal._id, 'proposed')}
                            >
                              Re-propose
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(deal._id)}
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}

                      {/* ── DRAFT: Creator can Delete ── */}
                      {deal.status === 'draft' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(deal._id, 'proposed')}
                          >
                            Submit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDelete(deal._id)}
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}

                      {/* ── COMPLETED: No actions (read-only) ── */}
                      {deal.status === 'completed' && (
                        <Badge variant="success">Done</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No deals yet</h3>
              <p className="text-gray-500 mt-1">
                {user.role === 'investor'
                  ? 'Create your first deal with an entrepreneur'
                  : 'Deals from investors will appear here'}
              </p>
              <Button
                className="mt-4"
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
              >
                Create Deal
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ✅ Add Deal Modal */}
      {showAddModal && (
        <AddDealModal
          onClose={() => setShowAddModal(false)}
          onDealAdded={handleDealAdded}
        />
      )}

      {/* ✅ Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};