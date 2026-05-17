import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import api from '../../lib/api'; // ✅ ADDED: API for backend requests

export const InvestorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // ✅ ADDED: backend investors state
  const [investors, setInvestors] = useState<any[]>([]);

  // ✅ ADDED: loading state
  const [loading, setLoading] = useState(false);

  // ==========================================
  // ✅ CHANGED: Fetch investors from backend
  // WHY?
  // Removed dummy data from ../../data/users
  // ==========================================
  const fetchInvestors = async () => {
    try {
      setLoading(true);

      const response = await api.get('/users/investors', {
        params: {
          search: searchQuery,
          stage: selectedStages.join(','), // send selected stages
          interest: selectedInterests.join(','), // send interests
        },
        withCredentials: true,
      });

      // ✅ Store API data
      setInvestors(response.data.investors || []);
    } catch (error) {
      console.error('Failed to fetch investors:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✅ CHANGED:
  // Refetch whenever filters/search changes
  // ==========================================
  useEffect(() => {
    fetchInvestors();
  }, [searchQuery, selectedStages, selectedInterests]);

  // ==========================================
  // ✅ CHANGED:
  // Generate filters from backend data
  // instead of dummy data
  // ==========================================
  const allStages = Array.from(
    new Set(
      investors.flatMap(
        (i) => i.investmentStage || []
      )
    )
  );

  const allInterests = Array.from(
    new Set(
      investors.flatMap(
        (i) => i.investmentInterests || []
      )
    )
  );

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage)
        ? prev.filter((s) => s !== stage)
        : [...prev, stage]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Find Investors
        </h1>
        <p className="text-gray-600">
          Connect with investors who match your startup's needs
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
              {/* Investment Stage */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Investment Stage
                </h3>

                <div className="space-y-2">
                  {allStages?.map((stage) => (
                    <button
                      key={stage}
                      onClick={() =>
                        toggleStage(stage)
                      }
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${selectedStages.includes(stage)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Interests */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Investment Interests
                </h3>

                <div className="flex flex-wrap gap-2">
                  {allInterests?.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="focus:outline-none"
                    >
                      <Badge
                        variant={
                          selectedInterests.includes(interest)
                            ? "primary"
                            : "gray"
                        }
                      >
                        {interest}
                      </Badge>
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
                    <MapPin
                      size={16}
                      className="mr-2"
                    />
                    San Francisco, CA
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search investors by name, interests, or keywords..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              startAdornment={
                <Search size={18} />
              }
              fullWidth
            />

            <div className="flex items-center gap-2">
              <Filter
                size={18}
                className="text-gray-500"
              />

              {/* ✅ CHANGED:
                  Count from API */}
              <span className="text-sm text-gray-600">
                {investors.length} results
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <p className="text-center text-gray-500">
              Loading investors...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investors.length > 0 ? (
                investors?.map((investor) => (
                  <InvestorCard
                    // ✅ FIXED:
                    // MongoDB uses _id
                    key={investor._id}
                    investor={investor}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  No investors found
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};