"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle } from 'lucide-react';

export const Toaster = () => {
  const { toastMessage } = useAppContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  if (!toastMessage || !visible) return null;

  return (
    <div className="toast flex items-center gap-3">
      <CheckCircle className="h-4 w-4 text-[#c9a84c] shrink-0" strokeWidth={2} />
      <span>{toastMessage}</span>
    </div>
  );
};
