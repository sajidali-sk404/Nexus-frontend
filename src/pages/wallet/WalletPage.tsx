import React, { useState, useEffect } from 'react';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, SendHorizontal,
  DollarSign, TrendingUp, TrendingDown, Clock,
  Search, Filter, RefreshCw
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { DepositModal } from '../../components/wallet/DepositModal';
import { WithdrawModal } from '../../components/wallet/WithdrawModal';
import { TransferModal } from '../../components/wallet/TransferModal';
import { TransactionDetailModal } from '../../components/wallet/TransactionDetailModal';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';

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
const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null) return '$0.00';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const WalletPage: React.FC = () => {
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    pendingCount: 0,
  });

  // ✅ Fetch balance and transactions
  useEffect(() => {
    fetchWalletData();
  }, [user, filter]);

  const fetchWalletData = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);

      // Fetch balance
      const balanceRes = await api.get('/payments/balance');
      setBalance(balanceRes.data.balance || 0);

      // Fetch transactions
      const params: any = { limit: 50 };
      if (filter !== 'all') params.type = filter;

      const historyRes = await api.get('/payments/history', { params });

      const txns = historyRes.data.transactions || [];
      setTransactions(txns);

      // Calculate stats
      const deposits = txns
        .filter((t: any) => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const withdrawals = txns
        .filter((t: any) => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const transfers = txns
        .filter((t: any) => t.type === 'transfer' && t.status === 'completed')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const pending = txns.filter((t: any) => t.status === 'pending').length;

      setStats({
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        totalTransfers: transfers,
        pendingCount: pending,
      });
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  // ✅ After deposit/withdraw/transfer
  const handleTransactionComplete = () => {
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowTransfer(false);
    fetchWalletData();
  };

  // ✅ Get transaction icon and color
  const getTransactionStyle = (txn: any) => {
    const isIncoming =
      txn.type === 'deposit' ||
      (txn.type === 'transfer' && txn.to?._id === user?._id);

    switch (txn.type) {
      case 'deposit':
        return {
          icon: <ArrowDownLeft size={18} />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          sign: '+',
        };
      case 'withdrawal':
        return {
          icon: <ArrowUpRight size={18} />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          sign: '-',
        };
      case 'transfer':
        return isIncoming
          ? {
              icon: <ArrowDownLeft size={18} />,
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              sign: '+',
            }
          : {
              icon: <SendHorizontal size={18} />,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50',
              sign: '-',
            };
      default:
        return {
          icon: <DollarSign size={18} />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          sign: '',
        };
    }
  };

  // ✅ Status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'gray',
      refunded: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'gray'} size="sm" className="capitalize">
        {status}
      </Badge>
    );
  };

  // ✅ Get other party name
  const getOtherParty = (txn: any): string => {
    if (txn.type === 'deposit') return 'Deposit';
    if (txn.type === 'withdrawal') return 'Withdrawal';

    if (txn.type === 'transfer') {
      const isIncoming = txn.to?._id === user?._id;
      if (isIncoming) return txn.from?.name || 'Someone';
      return txn.to?.name || 'Someone';
    }

    return txn.description || 'Transaction';
  };

  // ✅ Filter by search
  const filteredTransactions = transactions.filter((txn) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      txn.description?.toLowerCase().includes(query) ||
      txn.reference?.toLowerCase().includes(query) ||
      txn.from?.name?.toLowerCase().includes(query) ||
      txn.to?.name?.toLowerCase().includes(query) ||
      txn.type?.toLowerCase().includes(query)
    );
  });

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600">Manage your funds and transactions</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <p className="text-primary-200 text-sm font-medium">Available Balance</p>
              <h2 className="text-4xl font-bold mt-1">{formatCurrency(balance)}</h2>
              <p className="text-primary-200 text-xs mt-2">
                Updated {formatTime(new Date().toISOString())}
              </p>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                className="bg-white text-primary-700 hover:bg-primary-50"
                leftIcon={<ArrowDownLeft size={18} />}
                onClick={() => setShowDeposit(true)}
              >
                Deposit
              </Button>

              <Button
                className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
                leftIcon={<ArrowUpRight size={18} />}
                onClick={() => setShowWithdraw(true)}
              >
                Withdraw
              </Button>

              <Button
                className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
                leftIcon={<SendHorizontal size={18} />}
                onClick={() => setShowTransfer(true)}
              >
                Transfer
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-full mr-4">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deposits</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalDeposits)}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-full mr-4">
                <TrendingDown size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Withdrawals</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalWithdrawals)}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-full mr-4">
                <SendHorizontal size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Transfers</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.totalTransfers)}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-full mr-4">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.pendingCount}
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
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'deposit', 'withdrawal', 'transfer'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-sm rounded-full capitalize ${
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          <span className="text-sm text-gray-500">
            {filteredTransactions.length} transactions
          </span>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((txn) => {
                const style = getTransactionStyle(txn);
                const isIncoming =
                  txn.type === 'deposit' ||
                  (txn.type === 'transfer' && txn.to?._id === user?._id);

                return (
                  <div
                    key={txn._id}
                    className="flex items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(txn)}
                  >
                    {/* Icon */}
                    <div className={`p-2.5 rounded-full mr-4 ${style.bgColor} ${style.color}`}>
                      {style.icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {getOtherParty(txn)}
                        </h3>
                        {getStatusBadge(txn.status)}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{txn.type}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatTime(txn.createdAt)}</span>
                        {txn.description && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 truncate">
                              {txn.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right ml-4">
                      <p className={`text-sm font-semibold ${
                        isIncoming ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {style.sign}{formatCurrency(txn.amount)}
                      </p>
                      {txn.currency !== 'USD' && (
                        <p className="text-xs text-gray-400">{txn.currency}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No transactions yet</h3>
              <p className="text-gray-500 mt-1">Start by depositing funds into your wallet</p>
              <Button
                className="mt-4"
                leftIcon={<ArrowDownLeft size={18} />}
                onClick={() => setShowDeposit(true)}
              >
                Make First Deposit
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onComplete={handleTransactionComplete}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          onClose={() => setShowWithdraw(false)}
          onComplete={handleTransactionComplete}
        />
      )}

      {showTransfer && (
        <TransferModal
          balance={balance}
          onClose={() => setShowTransfer(false)}
          onComplete={handleTransactionComplete}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};