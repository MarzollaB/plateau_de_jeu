// src/components/AnimatedCard.tsx
import React, { useEffect, useState, CSSProperties } from 'react';

interface AnimatedCardProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  onFinish: () => void;
  children: React.ReactNode;
}

export function AnimatedCard({ start, end, onFinish, children }: AnimatedCardProps) {
  const [pos, setPos] = useState(start);

  useEffect(() => {
    // déclenche la transition au prochain tick
    requestAnimationFrame(() => setPos(end));
    // appel onFinish après 600ms (durée CSS)
    const t = setTimeout(onFinish, 600);
    return () => clearTimeout(t);
  }, [end, onFinish]);

  const style: CSSProperties = {
    position: 'absolute',
    left: pos.x,
    top: pos.y,
    transition: 'all 0.6s ease-in-out',
    width: 120,
    height: 80,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000
  };

  return <div style={style}>{children}</div>;
}
