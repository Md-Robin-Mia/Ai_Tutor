import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Trophy, Medal, Award, Crown, Star, TrendingUp } from 'lucide-react'

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly')

  const leaderboardData = [
    { rank: 1, name: "Alex Johnson", score: 2450, change: 2, badge: "crown" },
    { rank: 2, name: "Sarah Williams", score: 2380, change: -1, badge: "medal" },
    { rank: 3, name: "Mike Chen", score: 2290, change: 1, badge: "medal" },
    { rank: 4, name: "Emma Davis", score: 2150, change: 3, badge: "award" },
    { rank: 5, name: "James Wilson", score: 2080, change: -2, badge: "award" },
    { rank: 6, name: "Lisa Anderson", score: 1950, change: 0, badge: "star" },
    { rank: 7, name: "David Brown", score: 1890, change: 4, badge: "star" },
    { rank: 8, name: "Maria Garcia", score: 1820, change: -1, badge: "star" },
  ]

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'crown':
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 'medal':
        return <Medal className="w-5 h-5 text-gray-400" />
      case 'award':
        return <Award className="w-5 h-5 text-orange-600" />
      default:
        return <Star className="w-5 h-5 text-blue-500" />
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50'
    if (rank === 2) return 'text-gray-600 bg-gray-50'
    if (rank === 3) return 'text-orange-600 bg-orange-50'
    return 'text-blue-600 bg-blue-50'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Leaderboard</h1>
          <p className="text-lg text-gray-600">Top performers this week</p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
            {['daily', 'weekly', 'monthly', 'all-time'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                onClick={() => setSelectedPeriod(period)}
                className={`capitalize ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {period.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <Card key={user.rank} className={`text-center shadow-xl ${index === 1 ? 'transform scale-105' : ''}`}>
              <CardHeader>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${getRankColor(user.rank)}`}>
                  <span className="text-2xl font-bold">{user.rank}</span>
                </div>
                {getBadgeIcon(user.badge)}
                <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-2">{user.score.toLocaleString()}</div>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${user.change > 0 ? 'text-green-500' : user.change < 0 ? 'text-red-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${user.change > 0 ? 'text-green-500' : user.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {user.change > 0 ? `+${user.change}` : user.change === 0 ? '—' : user.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rest of Leaderboard */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Full Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboardData.slice(3).map((user) => (
                <div key={user.rank} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankColor(user.rank)}`}>
                      <span className="font-bold">{user.rank}</span>
                    </div>
                    {getBadgeIcon(user.badge)}
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">Level {Math.floor(user.score / 500)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">{user.score.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className={`w-3 h-3 ${user.change > 0 ? 'text-green-500' : user.change < 0 ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${user.change > 0 ? 'text-green-500' : user.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {user.change > 0 ? `+${user.change}` : user.change === 0 ? '—' : user.change}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
