'use client';

import { useEffect, useState } from 'react';
import { Bold, CheckCircle, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', duration = 8000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'white',
      border: '1.5px solid #d1d5db',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      borderRadius: '1rem',
      padding: '1.25rem',
      maxWidth: '450px',
      minWidth: '300px',
    }}>
      <div style={{ flexShrink: 0 }}>
        {type === 'success'
          ? <CheckCircle style={{ width: 28, height: 28, color: 'green' }} />
          : <XCircle style={{ width: 28, height: 28, color: 'red' }} />
        }
      </div>

      <div style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'black',
        whiteSpace: 'pre-line',
        lineHeight: 1.6,
        flex: 1,
      }}>
        {message}
      </div>

      <button
        onClick={() => setVisible(false)}
        style={{
          marginLeft: 'auto',
          color: 'red',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          lineHeight: 1,
          flexShrink: 0, 
          fontWeight: 'bold'
        }}
      >
        ✕
      </button>
    </div>
  );
}  
 
 