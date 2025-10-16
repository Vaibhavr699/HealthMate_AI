"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const ToastContext = createContext();

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (options) => {
      const id = ++idCounter;
      const toast = {
        id,
        type: options.type || "info",
        title: options.title || "",
        message: options.message || "",
        duration: options.duration ?? 4000,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => remove(id), toast.duration);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(() => ({ show, remove }), [show, remove]);

  const getIcon = (type) => {
    const base = "w-5 h-5";
    switch (type) {
      case "success":
        return (
          <svg
            className={`${base} text-emerald-400`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className={`${base} text-red-400`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01m-6.938 4h13.856A2.062 2.062 0 0021 17.938V6.062A2.062 2.062 0 0018.938 4H5.062A2.062 2.062 0 003 6.062v11.876A2.062 2.062 0 005.062 20z"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className={`${base} text-yellow-400`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856A2.062 2.062 0 0021 17.938V6.062A2.062 2.062 0 0018.938 4H5.062A2.062 2.062 0 003 6.062v11.876A2.062 2.062 0 005.062 20z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className={`${base} text-blue-400`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container (bottom-right) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999] max-w-[90vw] sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`relative flex items-start gap-3 p-4 rounded-lg shadow-xl text-white border-l-4
              backdrop-blur-md bg-gray-900/90 animate-slide-up-fade
              ${
                t.type === "success"
                  ? "border-emerald-500"
                  : t.type === "error"
                  ? "border-red-500"
                  : t.type === "warning"
                  ? "border-yellow-500"
                  : "border-blue-500"
              }
            `}
          >
            {getIcon(t.type)}

            <div className="flex-1">
              {t.title && (
                <div className="font-semibold mb-1 leading-tight">
                  {t.title}
                </div>
              )}
              <div className="text-sm opacity-90 leading-snug">{t.message}</div>

              {/* Progress bar */}
              {t.duration > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700 rounded-b-md overflow-hidden">
                  <div
                    className={`h-full transition-all
                    ${
                      t.type === "success"
                        ? "bg-emerald-500"
                        : t.type === "error"
                        ? "bg-red-500"
                        : t.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    } animate-progress`}
                    style={{
                      animationDuration: `${t.duration}ms`,
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => remove(t.id)}
              className="text-gray-400 hover:text-white transition ml-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-up-fade {
          animation: slideUpFade 0.3s ease-out forwards;
        }

        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};


