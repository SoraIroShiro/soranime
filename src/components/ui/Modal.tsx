'use client';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
}

export default function Modal({ isOpen, onClose, title, message, type, icon }: ModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-600',
          text: 'text-green-100',
          border: 'border-green-500',
          button: 'bg-green-700 hover:bg-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-600',
          text: 'text-red-100',
          border: 'border-red-500',
          button: 'bg-red-700 hover:bg-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-600',
          text: 'text-yellow-100',
          border: 'border-yellow-500',
          button: 'bg-yellow-700 hover:bg-yellow-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-600',
          text: 'text-blue-100',
          border: 'border-blue-500',
          button: 'bg-blue-700 hover:bg-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-600',
          text: 'text-gray-100',
          border: 'border-gray-500',
          button: 'bg-gray-700 hover:bg-gray-800'
        };
    }
  };

  const styles = getTypeStyles();
  const defaultIcon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-600 animate-fade-in">
        {/* Header */}
        <div className={`${styles.bg} ${styles.text} px-6 py-4 rounded-t-lg border-b ${styles.border}`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon || defaultIcon}</span>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-750 rounded-b-lg border-t border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className={`${styles.button} text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800`}
          >
            OK
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}