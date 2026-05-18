import React from 'react';
import {
  X, ArrowDownLeft, ArrowUpRight, SendHorizontal,
  DollarSign, Calendar, Hash, FileText
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
}

const formatCurrency = (amount: number): string => {
  return `$${(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const { user } = useAuth();
  const txn = transaction;

  const isIncoming =
    txn.type === 'deposit' ||
    (txn.type === 'transfer' && txn.to?._id === user?._id);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'gray',
      refunded: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'gray'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getTypeIcon = () => {
    switch (txn.type) {
      case 'deposit':
        return <ArrowDownLeft size={24} className="text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight size={24} className="text-red-600" />;
      case 'transfer':
        return isIncoming
          ? <ArrowDownLeft size={24} className="text-green-600" />
          : <SendHorizontal size={24} className="text-orange-600" />;
      default:
        return <DollarSign size={24} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Amount header */}
            <div className="text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isIncoming ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {getTypeIcon()}
              </div>

              <p className={`text-3xl font-bold ${
                isIncoming ? 'text-green-600' : 'text-red-600'
              }`}>
                {isIncoming ? '+' : '-'}{formatCurrency(txn.amount)}
              </p>

              <div className="flex items-center justify-center gap-2 mt-2">
                {getStatusBadge(txn.status)}
                <span className="text-sm text-gray-500 capitalize">{txn.type}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              {/* From */}
              {txn.from && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">From</span>
                  <div className="flex items-center">
                    <Avatar
                      src={txn.from.profilePic || txn.from.avatarUrl || ''}
                      alt={txn.from.name || 'User'}
                      size="sm"
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">
                      {txn.from._id === user?._id ? 'You' : txn.from.name}
                    </span>
                  </div>
                </div>
              )}

              {/* To */}
              {txn.to && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">To</span>
                  <div className="flex items-center">
                    <Avatar
                      src={txn.to.profilePic || txn.to.avatarUrl || ''}
                      alt={txn.to.name || 'User'}
                      size="sm"
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">
                      {txn.to._id === user?._id ? 'You' : txn.to.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} /> Date
                </span>
                <span className="text-sm font-medium">
                  {txn.createdAt
                    ? new Date(txn.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </span>
              </div>

              {/* Transaction ID */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Hash size={14} /> ID
                </span>
                <span className="text-xs font-mono text-gray-600">
                  {txn._id}
                </span>
              </div>

              {/* Currency */}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Currency</span>
                <span className="text-sm font-medium">{txn.currency || 'USD'}</span>
              </div>

              {/* Payment Method */}
              {txn.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm font-medium capitalize">{txn.paymentMethod}</span>
                </div>
              )}

              {/* Fee */}
              {txn.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fee</span>
                  <span className="text-sm font-medium">{formatCurrency(txn.fee)}</span>
                </div>
              )}

              {/* Net Amount */}
              {txn.netAmount && txn.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Net Amount</span>
                  <span className="text-sm font-medium">{formatCurrency(txn.netAmount)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {(txn.description || txn.reference) && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1 mb-1">
                  <FileText size={14} /> Description
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {txn.description || txn.reference}
                </p>
              </div>
            )}

            {/* Close */}
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};