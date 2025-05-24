import type React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, XCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Loading...', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionButton,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
      )}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
      {actionButton && actionButton}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryButtonText = 'Try Again',
  actionButton,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <XCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <Loader2 className="mr-2 h-4 w-4" />
          {retryButtonText}
        </Button>
      )}
      {actionButton && actionButton}
    </div>
  );
}

export const LoadingStates = {
  LoadingSpinner,
  EmptyState,
  ErrorState,
};
