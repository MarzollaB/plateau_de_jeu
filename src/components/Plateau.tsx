// src/components/Plateau.tsx
import React, { ReactNode, useRef } from 'react'
import { useDrop } from 'react-dnd'

interface PlateauProps {
  onDrop: (id: string, x: number, y: number) => void
  children: ReactNode
}

export function Plateau({ onDrop, children }: PlateauProps) {
  const ref = useRef<HTMLDivElement>(null)
  // dimensions du plateau (tu peux ajuster le facteur de zoom)
  const width = 764 * 1.2
  const height = 529 * 1.2

  // configuration du drop
  const [, drop] = useDrop({
    accept: 'MAGNET',
    drop: (item: { id: string }, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (clientOffset && ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const x = clientOffset.x - rect.left
        const y = clientOffset.y - rect.top
        onDrop(item.id, x, y)
      }
    }
  })

  const style: React.CSSProperties = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    margin: '0 auto', // centre horizontal
    backgroundImage: 'url(/Plateau_de_jeu.png)',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    overflow: 'visible'
  }

  return (
    <div ref={drop(ref)} style={style}>
      {children}
    </div>
  )
}