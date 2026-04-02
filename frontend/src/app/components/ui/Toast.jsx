'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', duration = 5000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'white',
      border: '1px solid #d1d5db',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      borderRadius: '1rem',
      padding: '1.25rem',
      maxWidth: '380px',
      minWidth: '280px',
    }}>
      <div style={{ flexShrink: 0 }}>
        {type === 'success'
          ? <CheckCircle style={{ width: 28, height: 28, color: '#16a34a' }} />
          : <XCircle style={{ width: 28, height: 28, color: '#dc2626' }} />
        }
      </div>

      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: '#111827',
        whiteSpace: 'pre-line',
        lineHeight: 1.4,
        flex: 1,
      }}>
        {message}
      </div>

      <button
        onClick={() => setVisible(false)}
        style={{
          marginLeft: 'auto',
          color: '#9ca3af',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}  
 
 