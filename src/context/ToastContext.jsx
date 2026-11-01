import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'success', duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle className="w-5 h-5 text-[#FFD700] shrink-0" />,
              error: <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />,
              info: <Info className="w-5 h-5 text-[#FF8C00] shrink-0" />,
              festive: <Sparkles className="w-5 h-5 text-[#FFD700] shrink-0" />,
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.94 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-auto glass-card rounded-2xl p-4 border border-[#FFD700]/45 shadow-2xl flex items-start gap-3"
              >
                <div className="mt-0.5">{icons[toast.type] || icons.festive}</div>
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <p className="text-sm font-bold text-[#FFD700] leading-tight">
                      {toast.title}
                    </p>
                  )}
                  {toast.message && (
                    <p className="text-xs text-[#FFF4DC]/90 mt-1 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-[#FFF4DC]/60 hover:text-[#FFD700] transition-colors p-1 rounded-lg"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

