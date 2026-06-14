"use client";
// components/admin/ui/toast.tsx
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  show: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(Ctx);

const CONFIG: Record<ToastType, { icon: typeof CheckCircle2; bg: string }> = {
  success: { icon: CheckCircle2,   bg: "bg-[#0b5e3d]" },
  error:   { icon: XCircle,        bg: "bg-red-700"   },
  warning: { icon: AlertTriangle,  bg: "bg-amber-600" },
};

const DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), DURATION);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 inset-x-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none"
      >
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, bg } = CONFIG[type];
          return (
            <div
              key={id}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-xl pointer-events-auto ${bg}`}
              style={{ animation: "var(--animate-toast-pop)" }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {message}
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
