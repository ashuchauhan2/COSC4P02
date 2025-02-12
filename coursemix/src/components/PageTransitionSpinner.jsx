import { useState, useEffect } from 'react';
import Spinner from './Spinner';

export default function PageTransitionSpinner() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show spinner for 500ms
    const timer = setTimeout(() => {
      setShow(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <Spinner />
    </div>
  );
} 