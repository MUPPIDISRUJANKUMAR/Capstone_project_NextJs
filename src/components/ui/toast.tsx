import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react"; // Assuming lucide-react is available for icons

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number; // in milliseconds, default to 20000 (20 seconds)
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 8000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  // Positioned at top-middle with high z-index, increased width, classic look
  const baseStyle =
    "fixed top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-lg shadow-xl text-white flex items-center space-x-3 min-w-max";

  const typeStyles = {
    success: "bg-green-600", // Slightly darker green for classic look
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  const Icon = type === "success" ? CheckCircle : null; // Only show icon for success for now

  return (
    <div
      className={`${baseStyle} ${typeStyles[type]}`}
      style={{ zIndex: 9999 }}
    >
      {Icon && (
        <div className="p-1 bg-white bg-opacity-20 rounded-full">
          <Icon size={20} />
        </div>
      )}
      <span className="text-base font-medium whitespace-nowrap">{message}</span>
    </div>
  );
};
