// src/App.tsx
import React, { useState, useRef } from 'react'
import magnetsData from './data/magnets.json'
import cartesProblemes from './data/cartesProblemes.json'
import './App.css'

// thèmes, lettres et libellés
const themeOrder = [
  'preparation',
  'semis',
  'herbicide',
  'fongicide',
  'insecticide',
  'engrais',
  'recolte',
] as const

const legendChar: Record<typeof themeOrder[number], string> = {
  preparation: 'P',
  semis:       'S',
  herbicide:   'D',
  fongicide:   'F',
  insecticide: 'I',
  engrais:     'N',
  recolte:     'R',
}

const legendLabel: Record<typeof themeOrder[number], string> = {
  preparation: 'Préparation du sol',
  semis:       'Semis',
  herbicide:   'Désherbage',
  fongicide:   'Fongicide',
  insecticide: 'Insecticide',
  engrais:     'Apport d’azote',
  recolte:     'Récolte',
}

// type pour le JSON mis dans le drag
type DragPayload = {
  id: string
  theme: typeof themeOrder[number]
  color: string
}

// Composant Guide
function Guide({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Guide d'utilisation du Plateau de jeu</h1>
      <p>
        Bienvenue sur ce plateau de jeu ! Vous êtes les tout premiers à découvrir cet outil créé dans le cadre de mon TFE, intitulé :<br/>
        <em>« Et si l’étudiant savait déjà ? Des outils pédagogiques pour accompagner les apprenants adultes dans la formation en agronomie »</em>
      </p>
      <h2>Objectifs</h2>
      <p>
        Cet outil va vous permettre d'appréhender tout ce qui est « cyclique » dans votre formation : l'implantation et le développement d'une culture, le cycle de reproduction d'un ravageur ou d'un parasite, d'un bovin/ovin...
      </p>
      <h2>Règles</h2>
      <p>
        Grâce au plateau de jeu qui suit une année civile, vous allez pouvoir placer les pions correspondants aux stades de développement, aux différents travaux culturaux… bref, aux différents moments d'un cycle, tout autour du plateau.
      </p>
      <ol>
        <li>Placez les magnets partout autour du plateau afin de réaliser le cycle demandé (ici FH dans l'exemple).</li>
        <li>
          Dans la partie de droite de votre écran, sélectionnez ensuite votre thème via le menu déroulant, la partie du cycle à explorer via les cartes “Problèmes/Observation” (ici uniquement Préparation du sol et Semis sont accessibles) ⇒ cliquez sur “Piocher”.
        </li>
        <li>
          Aléatoirement, une carte “Problème” en lien avec le thème choisi apparaît. Celle-ci vous propose donc un problème constaté lors de votre étape du cycle, ainsi que la manière de l'observer.
        </li>
        <li>
          Pour la suite, vous avez 2 possibilités :
          <ul>
            <li>soit vous cliquez sur “Afficher les solutions”</li>
            <li>soit vous scannez le QR code disponible sur le plateau de jeu</li>
          </ul>
          ⇒ ces deux méthodes vous amènent sur la page complète des cartes “Problèmes/Solutions” triées par thème.
        </li>
      </ol>
      <p><em>Vous pouvez à tout moment consulter les cartes dans une page annexe, tout en conservant votre tableau de jeu.</em></p>
      <button
        onClick={onStart}
        style={{
          display: 'block',
          margin: '40px auto 0',
          padding: '10px 20px',
          background: '#333',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Accéder au plateau de jeu
      </button>
    </div>
  )
}

// Composant Plateau (drop natif)
function Plateau({
  width, height, placed, onDrop
}: {
  width: number
  height: number
  placed: Record<string, { x: number; y: number; theme: string; color: string }>
  onDrop: (payload: DragPayload, x: number, y: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data || !ref.current) return
    const payload: DragPayload = JSON.parse(data)
    const rect = ref.current.getBoundingClientRect()
    const size = 32
    const x = e.clientX - rect.left - size/2
    const y = e.clientY - rect.top  - size/2
    onDrop(payload, x, y)
  }

  return (
    <div
      ref={ref}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        width, height,
        background: `url(/Plateau_de_jeu.png) center/cover no-repeat`,
        border: '1px solid #ccc',
        margin: '0 auto',
      }}
    >
      {Object.entries(placed).map(([key, { x, y, theme, color }]) => (
        <div key={key} style={{ position:'absolute', left:x, top:y, width:32, height:32 }}>
          <div
            draggable
            onDragStart={e=>{
              e.dataTransfer.setData(
                'application/json',
                JSON.stringify({ id:key, theme, color })
              )
            }}
            style={{
              width: '100%', height: '100%',
              lineHeight: '32px', textAlign: 'center',
              borderRadius: '50%',
              backgroundColor: color,
              color:'#fff', fontWeight:'bold',
              cursor:'grab', userSelect:'none'
            }}
          >
            {legendChar[theme as typeof themeOrder[number]]}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [showGuide, setShowGuide] = useState(true)

  const PLW = 764, PLH = 529
  const [placed, setPlaced] = useState<Record<string,{x:number,y:number,theme:string,color:string}>>({})
  const [selectedTheme, setSelectedTheme] = useState<typeof themeOrder[number]>('preparation')
  const [pickedCard, setPickedCard] = useState<typeof cartesProblemes[number] | null>(null)

  const handleDrop = (payload: DragPayload, x:number, y:number) => {
    const isFromPalette = magnetsData.some(m=>m.id===payload.id)
    const instanceId = isFromPalette
      ? `${payload.id}-${Date.now()}`
      : payload.id
    setPlaced(p=>({
      ...p,
      [instanceId]: { x,y, theme: payload.theme, color: payload.color }
    }))
  }

  const handlePick = () => {
    const pool = cartesProblemes.filter(c => c.theme === selectedTheme)
    if (pool.length === 0) {
      setPickedCard(null)
    } else {
      const idx = Math.floor(Math.random() * pool.length)
      setPickedCard(pool[idx])
    }
  }

  const handleShowSolutions = () => {
    window.open('https://marzollab.github.io/cartes-PB-SOL/', '_blank')
  }

  if (showGuide) {
    return <Guide onStart={() => setShowGuide(false)} />
  }

  return (
    <div style={{ display:'flex', width:'100%', height:'100%', boxSizing:'border-box' }}>
      {/* ← 2/3 gauche */}
      <div style={{ flex:2, overflow:'auto', background:'#f0f0f0', padding:20 }}>
        <Plateau width={PLW} height={PLH} placed={placed} onDrop={handleDrop} />

        {/* LÉGENDE */}
        <div style={{
          width:PLW, margin:'20px auto',
          display:'grid',
          gridTemplateColumns:`repeat(${themeOrder.length},1fr)`,
          background:'#fff',
          padding:'12px 0',
          borderRadius:8,
          border:'1px solid #ddd',
        }}>
          {themeOrder.map(th=>{
            const color = magnetsData.find(m=>m.theme===th)!.color
            return (
              <div key={th} style={{ textAlign:'center', color:'#333' }}>
                <div style={{
                  width:32, height:32, lineHeight:'32px',
                  margin:'0 auto', borderRadius:'50%',
                  backgroundColor:color, color:'#fff', fontWeight:'bold'
                }}>
                  {legendChar[th]}
                </div>
                <div style={{ fontSize:14, marginTop:6 }}>
                  {legendLabel[th]}
                </div>
              </div>
            )
          })}
        </div>

        {/* PALETTE DE MAGNETS */}
        <div style={{
          width:PLW, margin:'10px auto',
          display:'grid',
          gridTemplateColumns:`repeat(${themeOrder.length},1fr)`,
          gap:12, justifyItems:'center'
        }}>
          {themeOrder.map(th=>(
            <div key={th}>
              {magnetsData.filter(m=>m.theme===th).map(m=>(
                <div
                  key={m.id}
                  draggable
                  onDragStart={e=>
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({ id:m.id, theme:m.theme, color:m.color })
                    )
                  }
                  style={{ cursor:'grab', margin:4 }}
                >
                  <div style={{
                    width:32, height:32, lineHeight:'32px',
                    textAlign:'center', borderRadius:'50%',
                    backgroundColor:m.color, color:'#fff',
                    fontWeight:'bold', userSelect:'none'
                  }}>
                    {legendChar[m.theme]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ← 1/3 droite */}
      <div style={{
        flex:1, padding:20, background:'#fff',
        borderLeft:'1px solid #ddd', overflow:'auto'
      }}>
        <label>
          <select
            value={selectedTheme}
            onChange={e=>setSelectedTheme(e.target.value as any)}
            style={{ width:'100%', padding:8, marginBottom:12 }}
          >
            {themeOrder.map(th=>(
              <option key={th} value={th}>{legendLabel[th]}</option>
            ))}
          </select>
        </label>
        <button
          onClick={handlePick}
          style={{
            width:'100%', padding:10, marginBottom:20,
            background:'#333', color:'#fff', border:'none', cursor:'pointer'
          }}
        >
          Piocher
        </button>

        <div style={{ color:'#555', minHeight:100 }}>
          {pickedCard === null ? (
            `Aucune carte pour « ${legendLabel[selectedTheme]} »`
          ) : (
            <article style={{ lineHeight:1.4 }}>
              <h2 style={{ margin:'0 0 8px', fontSize:18 }}>{pickedCard.titre}</h2>
              <p style={{ fontStyle:'italic', margin:'0 0 8px' }}>{pickedCard.recto}</p>
              {pickedCard.htmlContent ? (
                <div
                  style={{ margin:'0 0 8px' }}
                  dangerouslySetInnerHTML={{ __html: pickedCard.htmlContent }}
                />
              ) : pickedCard.diagnostic ? (
                <p style={{ margin:'0 0 8px' }}>
                  <strong>Diagnostic :</strong> {pickedCard.diagnostic}
                </p>
              ) : null}
              {pickedCard.source && (
                <p style={{ fontSize:12, color:'#888', margin:0 }}>
                  Source : {pickedCard.source}
                </p>
              )}
            </article>
          )}
        </div>

        {/* BOUTON : afficher les solutions */}
        <button
          onClick={handleShowSolutions}
          style={{
            width:'100%', padding:10, marginTop:20,
            background:'#0066cc', color:'#fff',
            border:'none', cursor:'pointer', borderRadius:4
          }}
        >
          Afficher les solutions
        </button>
      </div>
    </div>
  )
}
