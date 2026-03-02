import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass rounded-[2.5rem] border border-white/10 p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div
              className={`absolute top-0 left-0 w-full h-2 ${isDestructive ? 'bg-rose-500' : 'bg-accent-primary'}`}
            />

            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDestructive ? 'bg-rose-500/20 text-rose-500' : 'bg-accent-primary/20 text-accent-primary'}`}
              >
                <AlertTriangle className="w-7 h-7" />
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/5 rounded-xl text-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
            <p className="text-text-secondary leading-relaxed mb-8">{message}</p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg ${
                  isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'
                    : 'gradient-bg hover:opacity-90 shadow-accent-primary/20'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
