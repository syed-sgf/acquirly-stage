/**
 * MetricCard Component
 * Displays individual financial metrics with color-coded quality indicators
 */

'use client';

import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface MetricCardProps {
  title: string;
  value: string;
  tooltip?: React.ReactNode;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  qualityLabel?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({
  title,
  value,
  tooltip,
  quality,
  qualityLabel,
  subtitle,
  icon,
  trend
}: MetricCardProps) {
  
  // Determine color classes based on quality
  const getColorClasses = () => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return {
          bg: 'bg-sgf-green-50 border-sgf-green-200',
          text: 'text-sgf-green-700',
          badgeBg: 'bg-sgf-green-100',
          badgeText: 'text-sgf-green-700'
        };
      case 'fair':
        return {
          bg: 'bg-sgf-gold-50 border-sgf-gold-200',
          text: 'text-sgf-gold-700',
          badgeBg: 'bg-sgf-gold-100',
          badgeText: 'text-sgf-gold-700'
        };
      case 'poor':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-700',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-700'
        };
    }
  };

  const getQualityIcon = () => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'fair':
        return <AlertTriangle className="w-4 h-4" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`rounded-xl border-2 p-5 ${colors.bg} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          {tooltip && (
            <Tooltip title={title} content={tooltip} />
          )}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.badgeBg}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`text-3xl font-bold font-mono mb-2 ${colors.text}`}>
        {value}
      </div>

      {/* Quality Badge */}
      {quality && qualityLabel && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.badgeBg} ${colors.badgeText}`}>
          {getQualityIcon()}
          {qualityLabel}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className="mt-2 text-xs text-gray-500">
          {subtitle}
        </div>
      )}

      {/* Trend Indicator */}
      {trend && trend !== 'neutral' && (
        <div className={`mt-2 flex items-center gap-1 text-xs ${trend === 'up' ? 'text-sgf-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span>{trend === 'up' ? 'Positive' : 'Concerning'}</span>
        </div>
      )}
    </div>
  );
}
