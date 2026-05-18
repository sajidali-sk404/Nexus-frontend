import React, { useState, useEffect } from 'react';
import { X, DollarSign, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

interface AddDealModalProps {
  onClose: () => void;
  onDealAdded: (deal: any) => void;
}

export const AddDealModal: React.FC<AddDealModalProps> = ({ onClose, onDealAdded }) => {
  const { user } = useAuth();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [equity, setEquity] = useState<number | ''>('');
  const [dealType, setDealType] = useState('equity');
  const [stage, setStage] = useState('seed');
  const [terms, setTerms] = useState('');
  const [startupName, setStartupName] = useState('');
  const [industry, setIndustry] = useState('');
  const [valuation, setValuation] = useState<number | ''>('');
  const [closingDate, setClosingDate] = useState('');

  // Partner selection
  const [searchPartner, setSearchPartner] = useState('');
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Search for partners (investors or entrepreneurs)
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchPartner || searchPartner.length < 2) {
        setPartners([]);
        return;
      }

      try {
        setSearchLoading(true);

        const endpoint =
          user?.role === 'investor' ? '/users/entrepreneurs' : '/users/investors';

        const response = await api.get(endpoint, {
          params: { search: searchPartner, limit: 5 },
        });

        setPartners(
          response.data.entrepreneurs || response.data.investors || []
        );
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchPartner, user]);

  // ✅ Auto-fill startup name if entrepreneur is selected
  useEffect(() => {
    if (selectedPartner && user?.role === 'investor') {
      setStartupName(selectedPartner.startupName || '');
      setIndustry(selectedPartner.industry || '');
    }
  }, [selectedPartner]);

  // ✅ Submit deal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount || !selectedPartner) {
      setError('Title, amount, and partner are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const dealData: any = {
        title,
        description,
        amount: Number(amount),
        equity: equity ? Number(equity) : 0,
        dealType,
        stage,
        terms,
        startupName,
        industry,
        valuation: valuation ? Number(valuation) : 0,
        closingDate: closingDate || null,
      };

      // Set investor/entrepreneur based on role
      if (user?.role === 'investor') {
        dealData.entrepreneurId = selectedPartner._id;
      } else {
        dealData.investorId = selectedPartner._id;
      }

      const response = await api.post('/deals', dealData);
      console.log('Deal created:', response.data);

      onDealAdded(response.data.deal);
    } catch (err: any) {
      console.error('Failed to create deal:', err);
      setError(err.response?.data?.message || 'Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Create New Deal</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Partner Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {user?.role === 'investor'
                  ? 'Select Entrepreneur *'
                  : 'Select Investor *'}
              </label>

              {selectedPartner ? (
                <div className="flex items-center justify-between p-3 border border-primary-200 bg-primary-50 rounded-lg">
                  <div className="flex items-center">
                    <Avatar
                      src={selectedPartner.avatarUrl || selectedPartner.profilePic || ''}
                      alt={selectedPartner.name}
                      size="sm"
                      className="mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPartner.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedPartner.startupName || selectedPartner.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPartner(null)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder={
                      user?.role === 'investor'
                        ? 'Search entrepreneurs...'
                        : 'Search investors...'
                    }
                    value={searchPartner}
                    onChange={(e) => setSearchPartner(e.target.value)}
                    startAdornment={<Search size={16} />}
                    fullWidth
                  />

                  {/* Search results dropdown */}
                  {partners.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {partners.map((partner) => (
                        <button
                          key={partner._id}
                          type="button"
                          onClick={() => {
                            setSelectedPartner(partner);
                            setSearchPartner('');
                            setPartners([]);
                          }}
                          className="w-full flex items-center p-3 hover:bg-gray-50 text-left"
                        >
                          <Avatar
                            src={partner.avatarUrl || partner.profilePic || ''}
                            alt={partner.name}
                            size="sm"
                            className="mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {partner.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {partner.startupName || partner.industry || partner.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchLoading && (
                    <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border rounded-lg shadow-lg text-center text-sm text-gray-500">
                      Searching...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <Input
              label="Deal Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Series A Investment in TechCo"
              fullWidth
            />

            {/* Amount and Equity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Investment Amount ($) *"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="500000"
                startAdornment={<DollarSign size={16} />}
              />

              <Input
                label="Equity (%)"
                type="number"
                value={equity}
                onChange={(e) => setEquity(e.target.value ? Number(e.target.value) : '')}
                placeholder="10"
              />
            </div>

            {/* Deal Type and Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Type
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                >
                  <option value="equity">Equity</option>
                  <option value="debt">Debt</option>
                  <option value="convertible-note">Convertible Note</option>
                  <option value="safe">SAFE</option>
                  <option value="grant">Grant</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Stage
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B</option>
                  <option value="series-c">Series C</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Startup Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Startup Name"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="Startup name"
              />

              <Input
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., FinTech"
              />
            </div>

            {/* Valuation and Closing Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Valuation ($)"
                type="number"
                value={valuation}
                onChange={(e) => setValuation(e.target.value ? Number(e.target.value) : '')}
                placeholder="5000000"
              />

              <Input
                label="Expected Closing Date"
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 shadow-sm p-3"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the deal details..."
              />
            </div>

            {/* Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 shadow-sm p-3"
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Key terms and conditions..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Deal'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};