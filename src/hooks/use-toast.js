import { useState, useCallback } from 'react';

// Simple toast hook implementation
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Math.random().toString(36).slice(2);
    const newToast = {
      id,
      title,
      description,
      variant,
      timestamp: Date.now()
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    // For now, just console.log the toast
    console.log(`Toast [${variant}]: ${title} - ${description}`);
  }, []);

  const dismiss = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
}
