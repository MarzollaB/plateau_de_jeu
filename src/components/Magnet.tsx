// src/components/Magnet.tsx
import React from 'react';
import { useDrag } from 'react-dnd';

interface MagnetProps {
  id: string;
  label: string;
  color: string;
  position: { x: number; y: number };
}

export function Magnet({ id, label, color, position }: MagnetProps) {
  const size = 32; // diamètre du disque
  const [{ isDragging }, drag] = useDrag({
    type: 'MAGNET',
    item: { id },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x - size / 2,
    top: position.y - size / 2,
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: '50%',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: `${size}px`,
    cursor: 'move',
    opacity: isDragging ? 0.5 : 1,
    userSelect: 'none',
  };

  return (
    <div ref={drag} style={style}>
      {label}
    </div>
  );
}
