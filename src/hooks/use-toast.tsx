import React, { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTimeoutFn } from "react-use";
import {
  TbCheck,
  TbExclamationCircle,
  TbExclamationMark,
  TbInfoCircle,
} from "react-icons/tb";

import Portal from "@/components/Portal.tsx";
import { cn } from "@/helper/util/global";

interface ToastContextType {
  success: (message: string, timeout?: number) => void;
  error: (message: string, timeout?: number) => void;
  warning: (message: string, timeout?: number) => void;
  info: (message: string, timeout?: number) => void;
  default: (message: string, timeout?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  default: () => {},
});

type ToastType = "success" | "error" | "warning" | "info" | "default";
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeout: number;
}

const generateUEID = () => {
  let first: any = (Math.random() * 46656) | 0;
  let second: any = (Math.random() * 46656) | 0;

  first = ("000" + first.toString(36)).slice(-3);
  second = ("000" + second.toString(36)).slice(-3);

  return first + second;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const open = ({
    message,
    type = "success",
    timeout = 5000,
  }: {
    message: string;
    type: "success" | "error" | "warning" | "info" | "default";
    timeout: number;
  }) => {
    setToasts((prev) => [
      { id: generateUEID(), message, type, timeout },
      ...prev,
    ]);
  };

  const close = (id: any) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast: any) => toast.id !== id),
    );
  };

  const success = (message: string, timeout = 5000) => {
    open({ message, type: "success", timeout });
  };

  const error = (message: string, timeout = 5000) => {
    open({ message, type: "error", timeout });
  };

  const warning = (message: string, timeout = 5000) => {
    open({ message, type: "warning", timeout });
  };

  const info = (message: string, timeout = 5000) => {
    open({ message, type: "info", timeout });
  };

  const _default = (message: string, timeout = 5000) => {
    open({ message, type: "default", timeout });
  };

  const value = { success, error, warning, info, default: _default };

  return (
    <ToastContext.Provider value={value as any}>
      {children}
      <Portal selector="body">
        <div
          className={cn(
            "fixed bottom-0 left-1/2 z-[999] w-full -translate-x-1/2 transform space-y-3 p-4 md:w-max md:max-w-md md:p-8",
            {
              "pointer-events-none": !toasts.length,
            },
          )}
        >
          <AnimatePresence>
            {toasts.reverse().map((toast: any) => (
              <Toast
                key={toast.id}
                toast={toast}
                onClose={() => close(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </Portal>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const Toast = ({ toast, onClose }: any) => {
  useTimeoutFn(onClose, toast.timeout);

  return (
    <motion.div
      layout
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "z-[9999] flex w-full items-start rounded-xl px-4 py-3",
        { "bg-green-600 text-white": toast.type === "success" },
        { "bg-red-600 text-white": toast.type === "error" },
        { "bg-orange-600 text-white": toast.type === "warning" },
        { "bg-blue-600 text-white": toast.type === "info" },
        { "bg-white text-gray-800 shadow": toast.type === "default" },
      )}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      initial={{ opacity: 0, y: 30, scale: 0.3 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
    >
      <div className="mr-3 mt-[2px]">
        {toast.type === "success" && <TbCheck size="20" />}
        {toast.type === "error" && <TbExclamationCircle size="20" />}
        {toast.type === "warning" && <TbExclamationMark size="20" />}
        {toast.type === "info" && <TbInfoCircle size="20" />}
      </div>
      <p className="leading-snug">{toast.message}</p>
    </motion.div>
  );
};
