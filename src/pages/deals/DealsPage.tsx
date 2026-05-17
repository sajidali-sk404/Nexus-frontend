import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';

import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';

// ✅ CHANGED: import API instance
// WHY: to fetch deals from backend instead of dummy data
import api from '../../lib/api';

interface Deal {
  _id: string;
  startup: {
    name: string;
    logo?: string;
    industry: string;
  };
  amount: string;
  equity: string;
  status: string;
  stage: string;
  lastActivity: string;
}

interface DealStats {
  totalInvestment: number;
  activeDeals: number;
  portfolioCompanies: number;
  closedThisMonth: number;
}

export const DealsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  // ✅ CHANGED: state for API data
  // WHY: remove dummy hardcoded data
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<DealStats | null>(null);

  // ✅ CHANGED: loading + error states
  // WHY: better UX when fetching data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statuses = [
    'Due Diligence',
    'Term Sheet',
    'Negotiation',
    'Closed',
    'Passed',
  ];

  // ✅ CHANGED: fetch deals from backend
  // WHY: use GET /api/deals endpoint
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);

        const response = await api.get('/deals');

        // Expected response:
        // {
        //   deals: [...],
        //   stats: {...}
        // }

        setDeals(response.data.deals || []);
        setStats(response.data.stats || null);
      } catch (err: any) {
        console.error('Error fetching deals:', err);
        setError(
          err.response?.data?.message || 'Failed to load deals'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Due Diligence':
        return 'primary';
      case 'Term Sheet':
        return 'secondary';
      case 'Negotiation':
        return 'accent';
      case 'Closed':
        return 'success';
      case 'Passed':
        return 'error';
      default:
        return 'gray';
    }
  };

  // ✅ CHANGED: frontend filtering on fetched data
  // WHY: search + status filters should work with backend data
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      searchQuery === '' ||
      deal.startup.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      deal.startup.industry
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus.length === 0 ||
      selectedStatus.includes(deal.status);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-gray-500">Loading deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Investment Deals
          </h1>
          <p className="text-gray-600">
            Track and manage your investment pipeline
          </p>
        </div>

        {/* Later connect this with POST /api/deals */}
        <Button>Add Deal</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg mr-3">
                <DollarSign
                  size={20}
                  className="text-primary-600"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Total Investment
                </p>

                {/* ✅ CHANGED: dynamic stats */}
                <p className="text-lg font-semibold text-gray-900">
                  ${stats?.totalInvestment || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg mr-3">
                <TrendingUp
                  size={20}
                  className="text-secondary-600"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Active Deals
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats?.activeDeals || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg mr-3">
                <Users
                  size={20}
                  className="text-accent-600"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Portfolio Companies
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats?.portfolioCompanies || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg mr-3">
                <Calendar
                  size={20}
                  className="text-success-600"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Closed This Month
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats?.closedThisMonth || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search deals by startup name or industry..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />

            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className="focus:outline-none"
                  type="button"
                >
                  <Badge
                    variant={
                      selectedStatus.includes(status)
                        ? getStatusColor(status)
                        : "gray"
                    }
                    className="cursor-pointer"
                  >
                    {status}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            Active Deals
          </h2>
        </CardHeader>

        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left">
                    Startup
                  </th>
                  <th className="px-6 py-3 text-left">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left">
                    Equity
                  </th>
                  <th className="px-6 py-3 text-left">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left">
                    Last Activity
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Avatar
                          src={deal.startup.logo as string}
                          alt={deal.startup.name}
                          size="sm"
                        />

                        <div className="ml-4">
                          <div className="font-medium">
                            {deal.startup.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {deal.startup.industry}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{deal.amount}</td>
                    <td>{deal.equity}</td>

                    <td>
                      <Badge
                        variant={getStatusColor(
                          deal.status
                        )}
                      >
                        {deal.status}
                      </Badge>
                    </td>

                    <td>{deal.stage}</td>

                    <td>
                      {new Date(
                        deal.lastActivity
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};