import * as React from "react"
import { cn } from "../../lib/utils"

const LoadingSpinner = React.forwardRef(({ className, message, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center justify-center p-8", className)}
    {...props}
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
    {message && <p className="text-sm text-gray-600">{message}</p>}
  </div>
))
LoadingSpinner.displayName = "LoadingSpinner"

const LoadingDots = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex space-x-1", className)}
    {...props}
  >
    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  </div>
))
LoadingDots.displayName = "LoadingDots"

const LoadingPulse = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse bg-gray-200 rounded", className)}
    {...props}
  />
))
LoadingPulse.displayName = "LoadingPulse"

const LoadingSkeleton = React.forwardRef(({ className, rows = 3, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-3", className)}
    {...props}
  >
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
  </div>
))
LoadingSkeleton.displayName = "LoadingSkeleton"

export { LoadingSpinner, LoadingDots, LoadingPulse, LoadingSkeleton }
