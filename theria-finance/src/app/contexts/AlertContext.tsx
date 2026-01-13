import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AlertType, AlertProps } from '../components/Alert';

interface AlertItem extends Omit<AlertProps, 'onClose'> {}

interface AlertContextType {
  alerts: AlertItem[];
  showAlert: (type: AlertType, title: string, message?: string, duration?: number) => void;
  showSuccessAlert: (title: string, message?: string) => void;
  showErrorAlert: (title: string, message?: string) => void;
  showWarningAlert: (title: string, message?: string) => void;
  showInfoAlert: (title: string, message?: string) => void;
  showAddAlert: (itemName: string, message?: string) => void;
  showUpdateAlert: (itemName: string, message?: string) => void;
  showDeleteAlert: (itemName: string, message?: string) => void;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const showAlert = useCallback((type: AlertType, title: string, message?: string, duration?: number) => {
    const id = Date.now().toString();
    const newAlert: AlertItem = {
      id,
      type,
      title,
      message,
      duration,
    };

    setAlerts(prev => [...prev, newAlert]);
  }, []);

  // Convenience methods
  const showSuccessAlert = useCallback((title: string, message?: string) => {
    showAlert('success', title, message);
  }, [showAlert]);

  const showErrorAlert = useCallback((title: string, message?: string) => {
    showAlert('error', title, message);
  }, [showAlert]);

  const showWarningAlert = useCallback((title: string, message?: string) => {
    showAlert('warning', title, message);
  }, [showAlert]);

  const showInfoAlert = useCallback((title: string, message?: string) => {
    showAlert('info', title, message);
  }, [showAlert]);

  const showAddAlert = useCallback((itemName: string, message?: string) => {
    showAlert('add', `${itemName} Added`, message);
  }, [showAlert]);

  const showUpdateAlert = useCallback((itemName: string, message?: string) => {
    showAlert('update', `${itemName} Updated`, message);
  }, [showAlert]);

  const showDeleteAlert = useCallback((itemName: string, message?: string) => {
    showAlert('delete', `${itemName} Deleted`, message);
  }, [showAlert]);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        showAlert,
        showSuccessAlert,
        showErrorAlert,
        showWarningAlert,
        showInfoAlert,
        showAddAlert,
        showUpdateAlert,
        showDeleteAlert,
        removeAlert,
        clearAllAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
