import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Search,
  Filter,
  Loader2,
  Smartphone,
  Building
} from 'lucide-react';

interface PaymentAnalytics {
  period: string;
  revenue: {
    total: number;
    commission: number;
    teacherEarnings: number;
    transactions: number;
  };
  withdrawals: {
    totalAvailable: number;
    totalPending: number;
    totalWithdrawn: number;
    periodWithdrawals: number;
  };
  metrics: {
    averageTransactionValue: number;
    commissionRate: number;
  };
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
  adminNotes?: string;
  teacher: {
    name: string;
    email: string;
  };
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
  adminCommission: number;
  teacherEarnings: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  course: {
    title: string;
  };
  teacher: {
    name: string;
    email: string;
  };
  student: {
    name: string;
    email: string;
  };
}

interface TeacherEarning {
  teacher: {
    name: string;
    email: string;
  };
  totalEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  lastEarningDate?: string;
}

const AdminPaymentDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [teacherEarnings, setTeacherEarnings] = useState<TeacherEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');

  // Filter states
  const [withdrawalStatus, setWithdrawalStatus] = useState('all');
  const [transactionStatus, setTransactionStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [analyticsResponse, withdrawalsResponse, transactionsResponse, earningsResponse] = await Promise.all([
        fetch('/api/payments/admin/analytics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/payments/admin/withdrawals', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/payments/admin/transactions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/payments/admin/teacher-earnings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }

      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json();
        setWithdrawals(withdrawalsData.withdrawals);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }

      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json();
        setTeacherEarnings(earningsData.teacherEarnings);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal) return;

    setProcessingWithdrawal(selectedWithdrawal._id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/payments/admin/withdrawals/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal._id,
          action: processAction,
          adminNotes: adminNotes || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Withdrawal ${processAction}d successfully`);
        setShowProcessDialog(false);
        setSelectedWithdrawal(null);
        setAdminNotes('');
        fetchDashboardData(); // Refresh data
      } else {
        setError(data.message || `Failed to ${processAction} withdrawal`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setProcessingWithdrawal(null);
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
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const exportData = async (type: 'transactions' | 'withdrawals') => {
    try {
      const response = await fetch(`/api/payments/admin/export?format=csv&type=${type}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_data.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const openProcessDialog = (withdrawal: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setProcessAction(action);
    setAdminNotes('');
    setShowProcessDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Management</h1>
          <p className="text-purple-300">Manage transactions, withdrawals, and earnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('transactions')} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Download className="w-4 h-4 mr-2" />
            Export Transactions
          </Button>
          <Button variant="outline" onClick={() => exportData('withdrawals')} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            <Download className="w-4 h-4 mr-2" />
            Export Withdrawals
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">৳{analytics.revenue.total.toLocaleString()}</p>
                <p className="text-purple-400 text-xs mt-1">{analytics.revenue.transactions} transactions</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Admin Commission</p>
                <p className="text-3xl font-bold text-green-400 mt-2">৳{analytics.revenue.commission.toLocaleString()}</p>
                <p className="text-purple-400 text-xs mt-1">{analytics.metrics.commissionRate.toFixed(1)}% rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Teacher Earnings</p>
                <p className="text-3xl font-bold text-white mt-2">৳{analytics.revenue.teacherEarnings.toLocaleString()}</p>
                <p className="text-purple-400 text-xs mt-1">Paid to teachers</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Pending Withdrawals</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">৳{analytics.withdrawals.totalPending.toLocaleString()}</p>
                <p className="text-purple-400 text-xs mt-1">Awaiting processing</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="withdrawals" className="space-y-4">
        <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 p-1 rounded-xl">
          <TabsTrigger value="withdrawals" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
            Withdrawal Requests
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="earnings" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
            Teacher Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                  Withdrawal Requests
                </h3>
                <div className="flex gap-2">
                  <Select value={withdrawalStatus} onValueChange={setWithdrawalStatus}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="all" className="text-white">All Status</SelectItem>
                      <SelectItem value="pending" className="text-white">Pending</SelectItem>
                      <SelectItem value="processing" className="text-white">Processing</SelectItem>
                      <SelectItem value="completed" className="text-white">Completed</SelectItem>
                      <SelectItem value="failed" className="text-white">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="p-6">
              {withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals
                    .filter(w => withdrawalStatus === 'all' || w.status === withdrawalStatus)
                    .map((withdrawal) => (
                    <div key={withdrawal._id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            {getWithdrawalIcon(withdrawal.withdrawalMethod)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{withdrawal.transactionId}</p>
                            <p className="text-sm text-purple-300">
                              {withdrawal.teacher.name} ({withdrawal.teacher.email})
                            </p>
                            <p className="text-xs text-purple-400 capitalize">
                              {withdrawal.withdrawalMethod.replace('_', ' ')} • 
                              {new Date(withdrawal.createdAt).toLocaleDateString()}
                            </p>
                            {withdrawal.accountInfo.phoneNumber && (
                              <p className="text-xs text-purple-400">
                                Phone: {withdrawal.accountInfo.phoneNumber}
                              </p>
                            )}
                            {withdrawal.adminNotes && (
                              <p className="text-xs text-blue-400 mt-1">
                                Note: {withdrawal.adminNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            ৳{withdrawal.amount.toLocaleString()}
                          </p>
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {withdrawal.status}
                          </Badge>
                          {withdrawal.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => openProcessDialog(withdrawal, 'approve')}
                                disabled={processingWithdrawal === withdrawal._id}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30"
                              >
                                {processingWithdrawal === withdrawal._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProcessDialog(withdrawal, 'reject')}
                                disabled={processingWithdrawal === withdrawal._id}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-purple-300 py-8">
                  No withdrawal requests found
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                  All Transactions
                </h3>
                <div className="flex gap-2">
                  <Select value={transactionStatus} onValueChange={setTransactionStatus}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="all" className="text-white">All Status</SelectItem>
                      <SelectItem value="completed" className="text-white">Completed</SelectItem>
                      <SelectItem value="pending" className="text-white">Pending</SelectItem>
                      <SelectItem value="failed" className="text-white">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="p-6">
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions
                    .filter(t => transactionStatus === 'all' || t.paymentStatus === transactionStatus)
                    .map((transaction) => (
                    <div key={transaction._id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{transaction.course.title}</p>
                          <p className="text-sm text-purple-300">
                            Teacher: {transaction.teacher.name} • Student: {transaction.student.name}
                          </p>
                          <p className="text-xs text-purple-400">
                            {transaction.transactionId} • {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            ৳{transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-purple-400">
                            Commission: ৳{transaction.adminCommission.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-400">
                            Teacher: ৳{transaction.teacherEarnings.toLocaleString()}
                          </p>
                          <Badge className={getStatusColor(transaction.paymentStatus)}>
                            {transaction.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-purple-300 py-8">
                  No transactions found
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Teacher Earnings Overview
              </h3>
            </div>
            <div className="p-6">
              {teacherEarnings.length > 0 ? (
                <div className="space-y-4">
                  {teacherEarnings.map((earning) => (
                    <div key={earning.teacher.email} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{earning.teacher.name}</p>
                          <p className="text-sm text-purple-300">{earning.teacher.email}</p>
                          {earning.lastEarningDate && (
                            <p className="text-xs text-purple-400">
                              Last earning: {new Date(earning.lastEarningDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            ৳{earning.totalEarnings.toLocaleString()}
                          </p>
                          <div className="text-xs text-purple-400 space-y-1">
                            <p>Available: ৳{earning.availableBalance.toLocaleString()}</p>
                            <p>Pending: ৳{earning.pendingWithdrawals.toLocaleString()}</p>
                            <p>Withdrawn: ৳{earning.totalWithdrawn.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-purple-300 py-8">
                  No teacher earnings found
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Process Withdrawal Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {processAction === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                <p className="font-medium text-white">{selectedWithdrawal.transactionId}</p>
                <p className="text-sm text-purple-300">{selectedWithdrawal.teacher.name}</p>
                <p className="font-semibold text-white">৳{selectedWithdrawal.amount.toLocaleString()}</p>
                <p className="text-xs text-purple-400 capitalize">
                  {selectedWithdrawal.withdrawalMethod.replace('_', ' ')}
                </p>
              </div>

              <div>
                <Label htmlFor="adminNotes" className="text-purple-300">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={processAction === 'approve' ? 
                    "Add any processing notes..." : 
                    "Reason for rejection..."
                  }
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder-purple-400"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-red-400/30">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-400/30">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowProcessDialog(false)}
              disabled={processingWithdrawal !== null}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProcessWithdrawal}
              disabled={processingWithdrawal !== null}
              variant={processAction === 'reject' ? 'destructive' : 'default'}
              className={processAction === 'reject' 
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30"
              }
            >
              {processingWithdrawal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                processAction === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPaymentDashboard;
