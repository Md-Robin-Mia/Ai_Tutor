import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { TrendingUp, DollarSign, ShoppingBag, RefreshCw, Calendar, CreditCard, User, Star, ExternalLink } from 'lucide-react'
import api from '../lib/api'

interface Purchase {
  _id: string
  courseId: {
    _id: string
    title: string
    thumbnail?: string
  }
  teacherId: {
    _id: string
    name: string
    email: string
  }
  purchaseDate: string
  amount: number
  paymentMethod: string
  paymentStatus: string
  transactionId: string
  courseTitle: string
  teacherName: string
}

interface Wallet {
  balance: number
  totalSpent: number
  currency: string
  transactionCount: number
}

export default function StudentPurchaseHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
    totalSpent: 0,
    currency: 'BDT',
    transactionCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPurchaseHistory()
  }, [])

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching purchase history from /payments/student/dashboard');
      const response = await api.get('/payments/student/dashboard')
      
      console.log('📊 Purchase history response:', response.data);
      
      setPurchases(response.data.recentPurchases || [])
      setWallet(response.data.wallet || {
        balance: 0,
        totalSpent: 0,
        currency: 'BDT',
        transactionCount: 0
      })
    } catch (err: any) {
      console.error('❌ Error fetching purchase history:', err)
      console.error('❌ Error response:', err.response?.data)
      console.error('❌ Error status:', err.response?.status)
      setError('Failed to load purchase history')
      
      // Set default values on error
      setPurchases([])
      setWallet({
        balance: 0,
        totalSpent: 0,
        currency: 'BDT',
        transactionCount: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-md'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 backdrop-blur-md'
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30 backdrop-blur-md'
      case 'refunded':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30 backdrop-blur-md'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30 backdrop-blur-md'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card-advanced p-6 animate-pulse">
              <div className="h-20 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            </div>
          ))}
        </div>
        <div className="glass-card-advanced p-8 animate-pulse">
          <div className="h-64 bg-white/10 rounded-xl backdrop-blur-sm"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-black text-white">${wallet.totalSpent}</div>
          </div>
          <div className="text-blue-300 font-bold text-sm mb-2">Total Spent</div>
          <div className="flex items-center gap-2 text-blue-400 text-xs">
            <CreditCard className="w-3 h-3" />
            <span>Lifetime spending</span>
          </div>
        </div>

        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{wallet.transactionCount}</div>
          </div>
          <div className="text-purple-300 font-bold text-sm mb-2">Purchases</div>
          <div className="flex items-center gap-2 text-purple-400 text-xs">
            <Star className="w-3 h-3" />
            <span>Total transactions</span>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="glass-card-advanced p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              Purchase History
            </h2>
            <p className="text-white/70">
              Your course purchase history and transactions
            </p>
          </div>
          <Button 
            onClick={fetchPurchaseHistory}
            className="glass-button-secondary flex items-center gap-2 hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
          {error && (
            <div className="mb-6 p-4 text-sm text-red-300 bg-red-500/20 rounded-xl border border-red-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                {error}
              </div>
            </div>
          )}

          {purchases.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <ShoppingBag className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No Purchase History</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                You haven't purchased any courses yet. Start your learning journey today!
              </p>
              <Button 
                onClick={() => window.location.href = '/courses'}
                className="glass-button-primary hover:scale-105 transition-all duration-300"
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase._id}
                  className="glass-card-mini p-6 flex items-center justify-between hover:scale-102 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                      {purchase.courseId?.thumbnail ? (
                        <img
                          src={purchase.courseId.thumbnail}
                          alt={purchase.courseTitle}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-purple-300 text-2xl">📚</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors duration-300">
                        {purchase.courseTitle}
                      </h4>
                      <p className="text-white/70 text-sm mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {purchase.teacherName}
                      </p>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(purchase.paymentStatus)} backdrop-blur-md border`}>
                          {purchase.paymentStatus}
                        </Badge>
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(purchase.purchaseDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-2">${purchase.amount}</div>
                    <div className="text-sm text-white/70 mb-1 flex items-center gap-1 justify-end">
                      <CreditCard className="w-3 h-3" />
                      {purchase.paymentMethod.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-white/50 font-mono">
                      ID: {purchase.transactionId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
