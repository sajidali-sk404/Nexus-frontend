import React, {
  useState,
  useEffect
} from 'react';

import { Link } from 'react-router-dom';

import {
  Users,
  PieChart,
  Filter,
  Search,
  PlusCircle
} from 'lucide-react';

import { Button } from '../../components/ui/Button';

import {
  Card,
  CardBody,
  CardHeader
} from '../../components/ui/Card';

import { Input } from '../../components/ui/Input';

import { Badge } from '../../components/ui/Badge';

import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';

import { useAuth } from '../../context/AuthContext';

import api from '../../lib/api';

export const InvestorDashboard: React.FC = () => {

  const { user } = useAuth();

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    selectedIndustries,
    setSelectedIndustries
  ] = useState<string[]>([]);

  // ✅ BACKEND DATA
  const [entrepreneurs, setEntrepreneurs] =
    useState<any[]>([]);

  const [sentRequests, setSentRequests] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  if (!user) return null;

  // ─────────────────────────────
  // FETCH ENTREPRENEURS
  // ─────────────────────────────
  const fetchEntrepreneurs =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            '/users/entrepreneurs',
            {
              params: {
                search:
                  searchQuery,

                industry:
                  selectedIndustries.join(
                    ','
                  ),
              },
            }
          );

        setEntrepreneurs(
          response.data
            .entrepreneurs || []
        );

      } catch (error) {
        console.error(
          'Failed to fetch entrepreneurs:',
          error
        );

      } finally {
        setLoading(false);
      }
    };

  // ─────────────────────────────
  // FETCH SENT REQUESTS
  // ─────────────────────────────
  const fetchSentRequests =
    async () => {
      try {
        const response =
          await api.get(
            '/collaborations/get-sent-requests'
          );

        setSentRequests(
          response.data.requests || []
        );

      } catch (error) {
        console.error(
          'Failed to fetch requests:',
          error
        );
      }
    };

  // ─────────────────────────────
  // FETCH DATA
  // ─────────────────────────────
  useEffect(() => {
    fetchEntrepreneurs();
  }, [
    searchQuery,
    selectedIndustries
  ]);

  useEffect(() => {
    fetchSentRequests();
  }, []);

  // ─────────────────────────────
  // INDUSTRIES FROM BACKEND
  // ─────────────────────────────
  const industries =
    Array.from(
      new Set(
        entrepreneurs.map(
          (e) => e.industry
        )
      )
    );

  // ─────────────────────────────
  // TOGGLE INDUSTRY
  // ─────────────────────────────
  const toggleIndustry = (
    industry: string
  ) => {
    setSelectedIndustries(
      (prevSelected) =>
        prevSelected.includes(
          industry
        )
          ? prevSelected.filter(
            (i) =>
              i !== industry
          )
          : [
            ...prevSelected,
            industry
          ]
    );
  };

  // ─────────────────────────────
  // CONNECTION COUNT
  // ─────────────────────────────
  const acceptedConnections =
    sentRequests.filter(
      (req) =>
        req.status ===
        'accepted'
    ).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Discover Startups
          </h1>

          <p className="text-gray-600">
            Find and connect with promising entrepreneurs
          </p>
        </div>

        <Link to="/entrepreneurs">
          <Button
            leftIcon={
              <PlusCircle
                size={18}
              />
            }
          >
            View All Startups
          </Button>
        </Link>

      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">

        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            fullWidth
            startAdornment={
              <Search
                size={18}
              />
            }
          />
        </div>

        <div className="w-full md:w-1/3">

          <div className="flex items-center space-x-2">

            <Filter
              size={18}
              className="text-gray-500"
            />

            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>

            <div className="flex flex-wrap gap-2">

              {industries.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => toggleIndustry(industry)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={
                      selectedIndustries.includes(industry)
                        ? "primary"
                        : "gray"
                    }
                    className="cursor-pointer"
                  >
                    {industry}
                  </Badge>
                </button>
              ))}

            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>

            <div className="flex items-center">

              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users
                  size={20}
                  className="text-primary-700"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-primary-700">
                  Total Startups
                </p>

                <h3 className="text-xl font-semibold text-primary-900">
                  {
                    entrepreneurs.length
                  }
                </h3>
              </div>

            </div>

          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>

            <div className="flex items-center">

              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <PieChart
                  size={20}
                  className="text-secondary-700"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-secondary-700">
                  Industries
                </p>

                <h3 className="text-xl font-semibold text-secondary-900">
                  {
                    industries.length
                  }
                </h3>
              </div>

            </div>

          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>

            <div className="flex items-center">

              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users
                  size={20}
                  className="text-accent-700"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-accent-700">
                  Your Connections
                </p>

                <h3 className="text-xl font-semibold text-accent-900">
                  {
                    acceptedConnections
                  }
                </h3>
              </div>

            </div>

          </CardBody>
        </Card>

      </div>

      {/* ENTREPRENEURS GRID */}
      <div>

        <Card>

          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Featured Startups
            </h2>
          </CardHeader>

          <CardBody>

            {loading ? (

              <div className="text-center py-8">
                <p className="text-gray-600">
                  Loading startups...
                </p>
              </div>

            ) : entrepreneurs.length >
              0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {entrepreneurs.map(
                  (
                    entrepreneur
                  ) => (
                    <EntrepreneurCard
                      key={
                        entrepreneur._id
                      }
                      entrepreneur={
                        entrepreneur
                      }
                    />
                  )
                )}

              </div>

            ) : (

              <div className="text-center py-8">

                <p className="text-gray-600">
                  No startups match your filters
                </p>

                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery(
                      ''
                    );

                    setSelectedIndustries(
                      []
                    );
                  }}
                >
                  Clear filters
                </Button>

              </div>

            )}

          </CardBody>

        </Card>

      </div>

    </div>
  );
};