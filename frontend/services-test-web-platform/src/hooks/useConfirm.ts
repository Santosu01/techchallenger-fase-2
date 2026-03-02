import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((confirmOptions: ConfirmOptions) => {
    setOptions(confirmOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  }, [resolveCallback]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  }, [resolveCallback]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
};
