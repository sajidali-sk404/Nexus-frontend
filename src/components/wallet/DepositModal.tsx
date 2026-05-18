import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Building, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../lib/api';

interface DepositModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000, 50000];

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onComplete }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('mock');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/payments/deposit', {
        amount: Number(amount),
        currency: 'usd',
        paymentMethod,
      });

      console.log('Deposit response:', response.data);
      setSuccess(true);

      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Deposit Funds</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Success state */}
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800">Deposit Successful!</h3>
                <p className="text-gray-600 mt-2">
                  ${Number(amount).toLocaleString()} has been added to your wallet
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                )}

                {/* Amount input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0.00"
                    startAdornment={<DollarSign size={18} />}
                    fullWidth
                  />
                </div>

                {/* Quick amounts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((qa) => (
                      <button
                        key={qa}
                        onClick={() => setAmount(qa)}
                        className={`py-2 px-3 text-sm rounded-lg border ${
                          amount === qa
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        ${qa.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'mock', label: 'Test/Demo Payment', icon: <Wallet size={18} /> },
                      { id: 'card', label: 'Credit/Debit Card', icon: <CreditCard size={18} /> },
                      { id: 'bank', label: 'Bank Transfer', icon: <Building size={18} /> },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center p-3 rounded-lg border text-left ${
                          paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-3 text-gray-500">{method.icon}</span>
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    disabled={loading || !amount}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : `Deposit $${Number(amount || 0).toLocaleString()}`}
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