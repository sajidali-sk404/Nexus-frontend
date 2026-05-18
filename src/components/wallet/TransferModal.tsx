import React, { useState, useEffect } from 'react';
import { X, DollarSign, Search, SendHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

interface TransferModalProps {
  balance: number;
  onClose: () => void;
  onComplete: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  balance,
  onClose,
  onComplete,
}) => {
  const { user } = useAuth();

  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ✅ Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setUsers([]);
        return;
      }

      try {
        setSearchLoading(true);

        const endpoint =
          user?.role === 'investor' ? '/users/entrepreneurs' : '/users/investors';

        const response = await api.get(endpoint, {
          params: { search: searchQuery, limit: 5 },
        });

        setUsers(response.data.entrepreneurs || response.data.investors || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleTransfer = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!selectedUser) {
      setError('Please select a recipient');
      return;
    }
    if (amount > balance) {
      setError(`Insufficient balance. Available: $${balance.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/payments/transfer', {
        toUserId: selectedUser._id,
        amount: Number(amount),
        currency: 'usd',
        description: description || `Transfer to ${selectedUser.name}`,
      });

      setSuccess(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Transfer Funds</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SendHorizontal size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Transfer Successful!</h3>
                <p className="text-gray-600 mt-2">
                  ${Number(amount).toLocaleString()} sent to {selectedUser?.name}
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                )}

                {/* Balance */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient
                  </label>

                  {selectedUser ? (
                    <div className="flex items-center justify-between p-3 border border-primary-200 bg-primary-50 rounded-lg">
                      <div className="flex items-center">
                        <Avatar
                          src={selectedUser.avatarUrl || selectedUser.profilePic || ''}
                          alt={selectedUser.name}
                          size="sm"
                          className="mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium">{selectedUser.name}</p>
                          <p className="text-xs text-gray-500">{selectedUser.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        startAdornment={<Search size={16} />}
                        fullWidth
                      />

                      {users.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                          {users.map((u) => (
                            <button
                              key={u._id}
                              onClick={() => {
                                setSelectedUser(u);
                                setSearchQuery('');
                                setUsers([]);
                              }}
                              className="w-full flex items-center p-3 hover:bg-gray-50 text-left"
                            >
                              <Avatar
                                src={u.avatarUrl || u.profilePic || ''}
                                alt={u.name}
                                size="sm"
                                className="mr-3"
                              />
                              <div>
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchLoading && (
                        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border rounded-lg text-center text-sm text-gray-500">
                          Searching...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0.00"
                  startAdornment={<DollarSign size={18} />}
                  fullWidth
                />

                {/* Description */}
                <Input
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Investment payment"
                  fullWidth
                />

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTransfer}
                    disabled={loading || !amount || !selectedUser || Number(amount) > balance}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Send'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};