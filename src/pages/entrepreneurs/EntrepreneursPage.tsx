import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import api from '../../lib/api'; // ✅ ADDED: API instance for backend calls

export const EntrepreneursPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingRange, setSelectedFundingRange] = useState<string[]>([]);

  // ✅ ADDED: state for backend data
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);

  // ✅ ADDED: loading state
  const [loading, setLoading] = useState(false);

  // ==========================================
  // ✅ CHANGED: Fetch entrepreneurs from backend
  // WHY?
  // Previously data came from dummy file ../../data/users
  // Now data comes from API
  // ==========================================
  const fetchEntrepreneurs = async () => {
    try {
      setLoading(true);

      const response = await api.get('/users/entrepreneurs', {
        params: {
          search: searchQuery,
          industry: selectedIndustries.join(','), // send selected filters
          fundingRange: selectedFundingRange.join(','),
        },
        withCredentials: true,
      });

      // ✅ CHANGED:
      // Store backend entrepreneurs
      setEntrepreneurs(response.data.entrepreneurs || []);
    } catch (error) {
      console.error('Failed to fetch entrepreneurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✅ CHANGED: Fetch data whenever filters change
  // WHY?
  // Auto refresh list on search/filter update
  // ==========================================
  useEffect(() => {
    fetchEntrepreneurs();
  }, [searchQuery, selectedIndustries, selectedFundingRange]);

  // ==========================================
  // ✅ CHANGED:
  // Industries now generated from API data
  // instead of dummy users file
  // ==========================================
  const allIndustries = Array.from(
    new Set(
      entrepreneurs
        .map((e) => e.industry)
        .filter(Boolean)
    )
  );

  const fundingRanges = [
    '< $500K',
    '$500K - $1M',
    '$1M - $5M',
    '> $5M',
  ];

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleFundingRange = (range: string) => {
    setSelectedFundingRange((prev) =>
      prev.includes(range)
        ? prev.filter((r) => r !== range)
        : [...prev, range]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Find Startups
        </h1>
        <p className="text-gray-600">
          Discover promising startups looking for investment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Filters
              </h2>
            </CardHeader>

            <CardBody className="space-y-6">
              {/* Industry Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Industry
                </h3>

                <div className="space-y-2">
                  {allIndustries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedIndustries.includes(industry)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funding Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Funding Range
                </h3>

                <div className="space-y-2">
                  {fundingRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => toggleFundingRange(range)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFundingRange.includes(range)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location (still static) */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Location
                </h3>

                <div className="space-y-2">
                  <button className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    <MapPin size={16} className="mr-2" />
                    San Francisco, CA
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search startups by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              startAdornment={<Search size={18} />}
              fullWidth
            />

            <div className="flex items-center gap-2">
              <Filter
                size={18}
                className="text-gray-500"
              />

              {/* ✅ CHANGED:
                  Result count now from backend data */}
              <span className="text-sm text-gray-600">
                {entrepreneurs.length} results
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <p className="text-center text-gray-500">
              Loading entrepreneurs...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {entrepreneurs.length > 0 ? (
                entrepreneurs.map((entrepreneur) => (
                  <EntrepreneurCard
                    // ✅ FIXED:
                    // backend uses _id not id
                    key={entrepreneur._id}
                    entrepreneur={entrepreneur}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  No entrepreneurs found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};