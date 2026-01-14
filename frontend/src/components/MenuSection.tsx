import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface MenuItem {
  id: string
  title: string
  description?: string
  icon: string
  href?: string
  onClick?: () => void
  badge?: string
  popular?: boolean
}

interface MenuSectionProps {
  title: string
  description?: string
  items: MenuItem[]
  columns?: number
  showRefresh?: boolean
  onRefresh?: () => void
  variant?: 'grid' | 'list'
  className?: string
}

export default function MenuSection({
  title,
  description,
  items,
  columns = 4,
  showRefresh = false,
  onRefresh,
  variant = 'grid',
  className = ''
}: MenuSectionProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const location = useLocation()

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item.id)
    if (item.onClick) {
      item.onClick()
    }
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  if (variant === 'list') {
    return (
      <section className={`mb-12 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {showRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} className="text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedItem === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                  </div>
                  {item.badge && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.popular && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {showRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} className="text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        )}
      </div>

      <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-4`}>
        {items.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              selectedItem === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-6 relative">
              {item.popular && (
                <span className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
              {item.badge && (
                <span className="absolute -top-2 -right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

// Predefined menu items for common use cases
export const learningMethods = [
  {
    id: 'upload',
    title: 'Upload',
    description: 'File, audio, video',
    icon: '📁',
    popular: true
  },
  {
    id: 'link',
    title: 'Link',
    description: 'YouTube, Website',
    icon: '🔗'
  },
  {
    id: 'paste',
    title: 'Paste',
    description: 'Copied Text',
    icon: '📋'
  },
  {
    id: 'record',
    title: 'Record',
    description: 'Record Lecture',
    icon: '🎤'
  }
]

export const mainNavigation = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View your progress',
    icon: '📊',
    href: '/student-dashboard'
  },
  {
    id: 'courses',
    title: 'Courses',
    description: 'Browse courses',
    icon: '📚',
    href: '/courses'
  },
  {
    id: 'practice',
    title: 'Practice',
    description: 'Test your knowledge',
    icon: '✏️',
    href: '/quiz'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track your progress',
    icon: '📈',
    href: '/analytics'
  }
]

export const userSettings = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your profile',
    icon: '👤',
    href: '/profile'
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize experience',
    icon: '⚙️',
    href: '/preferences'
  },
  {
    id: 'help',
    title: 'Help & Support',
    description: 'Get assistance',
    icon: '❓',
    href: '/help'
  },
  {
    id: 'logout',
    title: 'Logout',
    description: 'Sign out of account',
    icon: '🚪',
    onClick: () => console.log('Logout clicked')
  }
]
