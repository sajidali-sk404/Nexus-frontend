import React, { useState } from 'react';
import { X, DollarSign, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../lib/api';

interface WithdrawModalProps {
  balance: number;
  onClose: () => void;
  onComplete: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  balance,
  onClose,
  onComplete,
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amount > balance) {
      setError(`Insufficient balance. Available: $${balance.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/payments/withdraw', {
        amount: Number(amount),
        currency: 'usd',
        description: description || `Withdrawal of $${amount}`,
      });

      setSuccess(true);
      setTimeout(() => onComplete(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Withdrawal failed');
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
            <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Withdrawal Successful!</h3>
                <p className="text-gray-600 mt-2">
                  ${Number(amount).toLocaleString()} has been withdrawn
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                )}

                {/* Balance display */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <Input
                  label="Withdrawal Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0.00"
                  startAdornment={<DollarSign size={18} />}
                  fullWidth
                />

                {/* Max button */}
                <button
                  onClick={() => setAmount(balance)}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Withdraw Maximum (${balance.toFixed(2)})
                </button>

                <Input
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for withdrawal"
                  fullWidth
                />

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWithdraw}
                    disabled={loading || !amount || amount > balance}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Withdraw'}
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