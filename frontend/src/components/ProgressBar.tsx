import React from 'react'

type ProgressBarSize = 'sm' | 'md' | 'lg'
type ProgressBarColor = 'blue' | 'green' | 'purple' | 'orange' | 'emerald' | 'red' | 'yellow'

interface ProgressBarProps {
  progress: number
  size?: ProgressBarSize
  color?: ProgressBarColor
  showPercentage?: boolean
  className?: string
  animated?: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'blue',
  showPercentage = true,
  className = '',
  animated = true
}) => {
  const sizeClasses: Record<ProgressBarSize, string> = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses: Record<ProgressBarColor, string> = {
    blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
    green: 'bg-gradient-to-r from-green-400 to-green-600',
    purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
    orange: 'bg-gradient-to-r from-orange-400 to-orange-600',
    emerald: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
    red: 'bg-gradient-to-r from-red-400 to-red-600',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
  }

  const bgColorClasses: Record<ProgressBarColor, string> = {
    blue: 'bg-blue-900/30',
    green: 'bg-green-900/30',
    purple: 'bg-purple-900/30',
    orange: 'bg-orange-900/30',
    emerald: 'bg-emerald-900/30',
    red: 'bg-red-900/30',
    yellow: 'bg-yellow-900/30'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-full ${bgColorClasses[color]} rounded-full overflow-hidden backdrop-blur-sm border border-white/10`}>
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full relative overflow-hidden transition-all duration-1000 ease-out ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        {showPercentage && (
          <span className="ml-3 text-sm font-semibold text-white min-w-[3rem] text-right">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  )
}

export default ProgressBar
