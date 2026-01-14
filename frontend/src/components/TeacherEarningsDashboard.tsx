import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Smartphone,
  CreditCard,
  Building,
  Loader2,
  Download
} from 'lucide-react';
import api from '../lib/api';

interface WalletInfo {
  totalEarnings: number;
  availableBalance: number;
  pendingWithdrawals: number;
  totalWithdrawn: number;
  currency: string;
  lastEarningDate?: string;
}

interface WithdrawalRequest {
  _id: string;
  transactionId: string;
  amount: number;
  withdrawalMethod: string;
  status: string;
  createdAt: string;
  processingDate?: string;
  completedDate?: string;
  failureReason?: string;
  accountInfo: {
    phoneNumber?: string;
    cardNumber?: string;
    bankName?: string;
    accountHolderName?: string;
  };
}

interface Transaction {
  _id: string;
  transactionId: string;
  amount: number;
  teacherEarnings: number;
  paymentStatus: string;
  createdAt: string;
  course: {
    title: string;
  };
  student: {
    name: string;
  };
}

const TeacherEarningsDashboard: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    withdrawalMethod: 'nagad',
    phoneNumber: '',
    cardNumber: '',
    accountHolderName: '',
    bankName: '',
    routingNumber: ''
  });

  // Add this function to simulate student purchases
const simulateStudentPurchase = (courseTitle: string, studentName: string, amount: number) => {
  const newTransaction: Transaction = {
    _id: `TX${Date.now()}`,
    transactionId: `TX${Date.now()}`,
    amount: amount,
    teacherEarnings: Math.floor(amount * 0.8), // 80% for teacher
    paymentStatus: 'completed',
    createdAt: new Date().toISOString(),
    course: {
      title: courseTitle
    },
    student: {
      name: studentName
    }
  };

  // Add to recent transactions
  setRecentTransactions(prev => [newTransaction, ...prev]);
  
  // Update wallet info
  setWalletInfo(prev => prev ? {
    ...prev,
    totalEarnings: prev.totalEarnings + newTransaction.teacherEarnings,
    availableBalance: prev.availableBalance + newTransaction.teacherEarnings,
    lastEarningDate: newTransaction.createdAt
  } : null);

  // Show success notification
  setSuccess(`New course sale: ${studentName} purchased "${courseTitle}" for ৳${amount}`);
};

useEffect(() => {
  fetchWalletData();
}, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API instance with proper authentication
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get('/payments/teacher/wallet'),
        api.get('/payments/withdrawal/history')
      ]);

      if (walletResponse.data) {
        setWalletInfo(walletResponse.data.wallet || {
          totalEarnings: 0,
          availableBalance: 0,
          pendingWithdrawals: 0,
          totalWithdrawn: 0,
          currency: 'BDT'
        });
        setRecentTransactions(walletResponse.data.recentTransactions || []);
      }

      if (transactionsResponse.data) {
        setWithdrawals(transactionsResponse.data.withdrawals || []);
      }
    } catch (err: any) {
      console.error('Failed to load wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
      
      // Set demo data on error
      setWalletInfo({
        totalEarnings: 0,
        availableBalance: 0,
        pendingWithdrawals: 0,
        totalWithdrawn: 0,
        currency: 'BDT'
      });
      setRecentTransactions([]);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawalForm.amount || Number(withdrawalForm.amount) < 50) {
      setError('Minimum withdrawal amount is 50 BDT');
      return;
    }

    setWithdrawing(true);
    setError(null);
    setSuccess(null);

    try {
      const accountInfo = {
        phoneNumber: withdrawalForm.phoneNumber || undefined,
        cardNumber: withdrawalForm.cardNumber || undefined,
        accountHolderName: withdrawalForm.accountHolderName || undefined,
        bankName: withdrawalForm.bankName || undefined,
        routingNumber: withdrawalForm.routingNumber || undefined
      };

      const response = await api.post('/payments/withdrawal/request', {
        amount: Number(withdrawalForm.amount),
        withdrawalMethod: withdrawalForm.withdrawalMethod,
        accountInfo
      });

      if (response.data) {
        setSuccess('Withdrawal request submitted successfully!');
        setShowWithdrawalModal(false);
        setWithdrawalForm({
          amount: '',
          withdrawalMethod: 'nagad',
          phoneNumber: '',
          cardNumber: '',
          accountHolderName: '',
          bankName: '',
          routingNumber: ''
        });
        
        // Refresh wallet data
        await fetchWalletData();
      }
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWithdrawalIcon = (method: string) => {
    switch (method) {
      case 'nagad':
      case 'bikash':
        return <Smartphone className="w-4 h-4" />;
      case 'bank_card':
        return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with gradient background */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white shadow-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Earnings Dashboard</h1>
          <p className="text-white/80 text-lg">Manage your course earnings and withdrawals</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-purple-300 text-sm">All Time</div>
          </div>
          <div className="text-3xl font-bold mb-2 text-white">
            ৳{walletInfo?.totalEarnings?.toLocaleString() || '0'}
          </div>
          <p className="text-purple-200 text-sm">
            {walletInfo?.lastEarningDate && 
              `Last earned: ${new Date(walletInfo.lastEarningDate).toLocaleDateString()}`
            }
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-emerald-300 text-sm">Available</div>
          </div>
          <div className="text-3xl font-bold mb-2 text-white">
            ৳{walletInfo?.availableBalance?.toLocaleString() || '0'}
          </div>
          <p className="text-emerald-200 text-sm">
            Ready for withdrawal
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-amber-300 text-sm">Pending</div>
          </div>
          <div className="text-3xl font-bold mb-2 text-white">
            ৳{walletInfo?.pendingWithdrawals?.toLocaleString() || '0'}
          </div>
          <p className="text-amber-200 text-sm">
            Being processed
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-blue-300 text-sm">Withdrawn</div>
          </div>
          <div className="text-3xl font-bold mb-2 text-white">
            ৳{walletInfo?.totalWithdrawn?.toLocaleString() || '0'}
          </div>
          <p className="text-blue-200 text-sm">
            Successfully withdrawn
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Ready to withdraw?</h3>
            <p className="text-gray-700 text-sm font-medium">
              {walletInfo && walletInfo.availableBalance >= 50 
                ? `You can withdraw up to ৳${walletInfo.availableBalance.toLocaleString()}`
                : 'Minimum withdrawal amount is ৳50'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowWithdrawalModal(true)}
              disabled={!walletInfo || walletInfo.availableBalance < 50}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              <ArrowUpRight className="w-5 h-5" />
              Request Withdrawal
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 p-0.5 inline-flex">
          <TabsTrigger 
            value="transactions" 
            className="data-[state=active]:bg-white/30 backdrop-blur-sm data-[state=active]:shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 flex items-center gap-1.5 hover:bg-white/20 text-white/70 data-[state=active]:text-emerald-600"
          >
            <TrendingUp className="w-3 h-3" />
            Recent
          </TabsTrigger>
          <TabsTrigger 
            value="withdrawals" 
            className="data-[state=active]:bg-white/30 backdrop-blur-sm data-[state=active]:shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 flex items-center gap-1.5 hover:bg-white/20 text-white/70 data-[state=active]:text-blue-600"
          >
            <Wallet className="w-3 h-3" />
            Withdrawals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-sm p-4 text-white border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Recent Course Sales</h3>
                  <p className="text-emerald-100 text-sm">Track your latest course earnings and student purchases</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg mb-2">{transaction.course.title}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center border border-white/30">
                              <span className="text-blue-600 font-semibold text-xs">
                                {transaction.student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-700 font-medium">Student: {transaction.student.name}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                          <p className="font-bold text-emerald-700 text-xl">
                            +৳{transaction.teacherEarnings.toLocaleString()}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Total: ৳{transaction.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-white/20 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30">
                    <TrendingUp className="w-8 h-8 text-emerald-300" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">No transactions yet</h4>
                  <p className="text-gray-700 text-sm max-w-xl mx-auto leading-relaxed mb-6">
                    When students purchase your courses, your earnings will appear here. 
                    <span className="block mt-1 text-emerald-600 font-semibold">
                      Start creating amazing courses to see your first transaction!
                    </span>
                  </p>
                  
                  {/* Course Performance Analysis */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/30 max-w-2xl mx-auto">
                    <h5 className="text-lg font-bold text-gray-800 mb-4">Why Your Courses Aren't Selling</h5>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-500/20 backdrop-blur-sm rounded-full p-1.5 mt-0.5">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Low Course Visibility</p>
                          <p className="text-xs text-gray-600">Your courses need better marketing and promotion</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-amber-500/20 backdrop-blur-sm rounded-full p-1.5 mt-0.5">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">High Competition</p>
                          <p className="text-xs text-gray-600">Similar courses available at lower prices</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/20 backdrop-blur-sm rounded-full p-1.5 mt-0.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Course Quality Issues</p>
                          <p className="text-xs text-gray-600">Students expect more engaging content</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500/20 backdrop-blur-sm rounded-full p-1.5 mt-0.5">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Poor Course Description</p>
                          <p className="text-xs text-gray-600">Course details don't attract students</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.05]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-emerald-600/80 backdrop-blur-sm rounded p-1">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">Potential Earnings</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">৳0</p>
                      <p className="text-xs text-emerald-600 mt-1">From course sales</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.05]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-600/80 backdrop-blur-sm rounded p-1">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-blue-700">Course Sales</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-blue-600 mt-1">Total purchases</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm p-4 text-white border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Withdrawal History</h3>
                  <p className="text-blue-100 text-sm">Track your withdrawal requests and payment status</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal._id} className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/30">
                          {getWithdrawalIcon(withdrawal.withdrawalMethod)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg mb-1">{withdrawal.transactionId}</p>
                          <p className="text-sm text-gray-700 capitalize font-medium">
                            {withdrawal.withdrawalMethod.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(withdrawal.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                          <p className="font-bold text-blue-700 text-xl">
                            ৳{withdrawal.amount.toLocaleString()}
                          </p>
                          <Badge className={`${getStatusColor(withdrawal.status)} mt-2 text-xs font-semibold`}>
                            {withdrawal.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-white/20 backdrop-blur-md rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30">
                    <Wallet className="w-8 h-8 text-blue-300" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">No withdrawal requests yet</h4>
                  <p className="text-gray-700 text-sm max-w-xl mx-auto leading-relaxed">
                    When you request withdrawals, they'll appear here with their current status. 
                    <span className="block mt-1 text-blue-600 font-semibold">
                      Start earning from your courses to make your first withdrawal!
                    </span>
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 border border-white/30 shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.05]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-blue-600/80 backdrop-blur-sm rounded p-1.5">
                          <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-blue-700">Available Balance</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">৳{walletInfo?.availableBalance?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-blue-600 font-medium">Ready for withdrawal</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-5 border border-white/30 shadow hover:shadow-lg transition-all duration-300 hover:scale-[1.05]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-amber-600/80 backdrop-blur-sm rounded p-1.5">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-amber-700">Minimum Withdrawal</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">৳50</p>
                      <p className="text-sm text-amber-600 font-medium">Required amount</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                Request Withdrawal
              </h3>
              <p className="text-emerald-100 text-sm mt-2">
                Withdraw your earnings to your preferred payment method
              </p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="amount" className="text-gray-700 font-medium">Amount (BDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    max={walletInfo?.availableBalance}
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder={`Available: ৳${walletInfo?.availableBalance?.toLocaleString() || '0'}`}
                    className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <Label htmlFor="withdrawalMethod" className="text-gray-700 font-medium">Withdrawal Method</Label>
                  <Select 
                    value={withdrawalForm.withdrawalMethod} 
                    onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, withdrawalMethod: value }))}
                  >
                    <SelectTrigger className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="bikash">bKash</SelectItem>
                      <SelectItem value="bank_card">Bank Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(withdrawalForm.withdrawalMethod === 'nagad' || withdrawalForm.withdrawalMethod === 'bikash') && (
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={withdrawalForm.phoneNumber}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                )}

                {withdrawalForm.withdrawalMethod === 'bank_card' && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={withdrawalForm.cardNumber}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountHolderName">Account Holder Name</Label>
                      <Input
                        id="accountHolderName"
                        value={withdrawalForm.accountHolderName}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                  </>
                )}

                {withdrawalForm.withdrawalMethod === 'bank_transfer' && (
                  <>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={withdrawalForm.bankName}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bankName: e.target.value }))}
                        placeholder="Dutch Bangla Bank"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountHolderName">Account Holder Name</Label>
                      <Input
                        id="accountHolderName"
                        value={withdrawalForm.accountHolderName}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        value={withdrawalForm.routingNumber}
                        onChange={(e) => setWithdrawalForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                        placeholder="090260414"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <Alert className="border-red-200 bg-red-50 text-red-800">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowWithdrawalModal(false)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={withdrawing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={withdrawing}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Request Withdrawal'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherEarningsDashboard;
