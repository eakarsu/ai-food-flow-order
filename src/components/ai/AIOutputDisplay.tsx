import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIOutputDisplayProps {
  title?: string;
  content: string;
  confidence?: number;
  tone?: string;
  keyPoints?: string[];
  type?: 'analysis' | 'prediction' | 'recommendation' | 'response';
  className?: string;
}

// Strip markdown code blocks (```...```) from AI responses
function stripCodeBlocks(text: string): string {
  // Remove ```language\n...\n``` blocks
  let cleaned = text.replace(/```[\w]*\n[\s\S]*?```/g, '');
  // Remove inline ``` pairs
  cleaned = cleaned.replace(/```/g, '');
  return cleaned.trim();
}

export function AIOutputDisplay({
  title = 'AI Analysis',
  content,
  confidence,
  tone,
  keyPoints,
  type = 'analysis',
  className,
}: AIOutputDisplayProps) {
  const cleanContent = stripCodeBlocks(content);
  const getGradient = () => {
    switch (type) {
      case 'prediction':
        return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'recommendation':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'response':
        return 'from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'from-purple-50 to-blue-50 border-purple-200';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'prediction':
        return 'text-blue-600';
      case 'recommendation':
        return 'text-green-600';
      case 'response':
        return 'text-amber-600';
      default:
        return 'text-purple-600';
    }
  };

  const getConfidenceColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-r rounded-lg p-6 border',
        getGradient(),
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={cn('h-5 w-5', getIconColor())} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          AI Powered
        </Badge>
      </div>

      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{cleanContent}</p>

      {keyPoints && keyPoints.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-600">Key Points:</p>
          <ul className="space-y-1">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(confidence !== undefined || tone) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6">
          {confidence !== undefined && (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Confidence</span>
                <span className="text-sm font-medium">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
              <Progress
                value={confidence * 100}
                className="h-2"
              />
            </div>
          )}
          {tone && (
            <Badge
              variant="outline"
              className={cn(
                'capitalize',
                tone === 'grateful' && 'border-green-300 text-green-700 bg-green-50',
                tone === 'apologetic' && 'border-amber-300 text-amber-700 bg-amber-50',
                tone === 'professional' && 'border-blue-300 text-blue-700 bg-blue-50',
                tone === 'empathetic' && 'border-purple-300 text-purple-700 bg-purple-50'
              )}
            >
              {tone}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

interface ConfidenceMeterProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceMeter({ value, size = 'md', showLabel = true }: ConfidenceMeterProps) {
  const percentage = Math.round(value * 100);

  const getColor = () => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (value >= 0.8) return 'bg-green-100';
    if (value >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Confidence</span>
          <span className={cn('font-medium', getColor())}>{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full', getBgColor(), sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            value >= 0.8 && 'bg-green-500',
            value >= 0.6 && value < 0.8 && 'bg-yellow-500',
            value < 0.6 && 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface SentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative';
  size?: 'sm' | 'md';
}

export function SentimentBadge({ sentiment, size = 'md' }: SentimentBadgeProps) {
  const config = {
    positive: {
      icon: TrendingUp,
      className: 'bg-green-100 text-green-800 border-green-200',
      label: 'Positive',
    },
    neutral: {
      icon: Info,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Neutral',
    },
    negative: {
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-800 border-red-200',
      label: 'Negative',
    },
  };

  const { icon: Icon, className, label } = config[sentiment];

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      <Icon className={cn('h-3 w-3', size === 'md' && 'h-4 w-4')} />
      {label}
    </Badge>
  );
}

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({ rating, maxRating = 5, size = 'md' }: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            sizeClasses[size],
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default AIOutputDisplay;
