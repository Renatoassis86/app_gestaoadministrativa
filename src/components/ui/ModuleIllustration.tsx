/**
 * Ilustrações SVG monocromáticas geradas inline para cada módulo.
 * Paleta: amber #d97706 (accent), slate-900 #0f172a (dark), slate-200 #e2e8f0 (light)
 */

interface IllustrationProps {
  width?: number
  style?: React.CSSProperties
}

/* ── Dashboard ──────────────────────────────────────────────────── */
export function DashboardIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Fundo do gráfico */}
      <rect x="20" y="20" width="240" height="140" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"/>
      {/* Barras */}
      {[
        { x: 40, h: 60, color: '#e2e8f0' },
        { x: 80, h: 90, color: '#e2e8f0' },
        { x: 120, h: 50, color: '#e2e8f0' },
        { x: 160, h: 110, color: '#d97706' },
        { x: 200, h: 80, color: '#0f172a' },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={140 - b.h} width="28" height={b.h} rx="4" fill={b.color}/>
      ))}
      {/* Linha de tendência */}
      <polyline points="54,80 94,50 134,90 174,30 214,60" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Pontos */}
      {[[54,80],[94,50],[134,90],[174,30],[214,60]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#d97706" stroke="#fff" strokeWidth="2"/>
      ))}
      {/* Mini KPI */}
      <rect x="25" y="25" width="55" height="30" rx="6" fill="#fff" stroke="#e2e8f0"/>
      <text x="52" y="44" textAnchor="middle" fill="#d97706" fontSize="13" fontWeight="800" fontFamily="serif">47</text>
    </svg>
  )
}

/* ── Escola / Parceiros ──────────────────────────────────────────── */
export function EscolaIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Prédio escola */}
      <rect x="80" y="60" width="120" height="100" rx="6" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      {/* Telhado */}
      <polygon points="70,60 140,20 210,60" fill="#0f172a"/>
      {/* Porta */}
      <rect x="115" y="120" width="30" height="40" rx="4" fill="#d97706"/>
      <circle cx="140" cy="141" r="3" fill="#fff"/>
      {/* Janelas */}
      {[[95,75],[155,75],[95,100],[155,100]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="24" height="20" rx="3" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5"/>
      ))}
      {/* Pessoas */}
      <circle cx="40" cy="145" r="12" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5"/>
      <path d="M 28 165 Q 40 155 52 165" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="240" cy="145" r="12" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5"/>
      <path d="M 228 165 Q 240 155 252 165" stroke="#fcd34d" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Estrela no topo */}
      <text x="140" y="18" textAnchor="middle" fill="#d97706" fontSize="12">★</text>
    </svg>
  )
}

/* ── Registros / Reunião ─────────────────────────────────────────── */
export function RegistroIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Prancheta */}
      <rect x="70" y="20" width="140" height="150" rx="10" fill="#fff" stroke="#e2e8f0" strokeWidth="2"/>
      <rect x="110" y="12" width="60" height="20" rx="6" fill="#0f172a"/>
      {/* Linhas de texto */}
      {[45,62,79,96,113].map((y,i) => (
        <rect key={i} x="88" y={y} width={i === 2 ? 80 : i === 4 ? 60 : 104} height="10" rx="3" fill={i === 0 ? '#d97706' : '#f1f5f9'}/>
      ))}
      {/* Checkbox items */}
      {[130, 148].map((y,i) => (
        <g key={i}>
          <rect x="88" y={y} width="12" height="12" rx="3" fill={i === 0 ? '#d97706' : '#f1f5f9'} stroke={i === 0 ? '#d97706' : '#e2e8f0'} strokeWidth="1.5"/>
          {i === 0 && <path d="M 91 136 L 94 139 L 99 133" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>}
          <rect x="106" y={y+1} width="70" height="8" rx="2" fill="#f1f5f9"/>
        </g>
      ))}
      {/* Caneta */}
      <rect x="175" y="100" width="10" height="50" rx="3" fill="#0f172a" transform="rotate(-30 180 125)"/>
      <polygon points="171,145 181,145 176,158" fill="#d97706" transform="rotate(-30 176 151)"/>
    </svg>
  )
}

/* ── Pipeline / Kanban ───────────────────────────────────────────── */
export function PipelineIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Colunas kanban */}
      {[
        { x: 20, color: '#e2e8f0', cards: 3 },
        { x: 80, color: '#fef3c7', cards: 2 },
        { x: 140, color: '#dbeafe', cards: 2 },
        { x: 200, color: '#d97706', cards: 1 },
      ].map((col, ci) => (
        <g key={ci}>
          <rect x={col.x} y="20" width="52" height="150" rx="8" fill={col.color} opacity=".4"/>
          <rect x={col.x} y="20" width="52" height="20" rx="8" fill={ci === 3 ? '#d97706' : '#0f172a'} opacity=".8"/>
          {Array.from({length: col.cards}).map((_, i) => (
            <rect key={i} x={col.x+4} y={50+i*38} width="44" height="30" rx="5" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5"/>
          ))}
        </g>
      ))}
      {/* Setas de progressão */}
      {[68, 128, 188].map((x, i) => (
        <path key={i} d={`M ${x} 95 L ${x+10} 95`} stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arrow)"/>
      ))}
    </svg>
  )
}

/* ── Jornada / Timeline ──────────────────────────────────────────── */
export function JornadaIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Linha do tempo */}
      <line x1="50" y1="90" x2="230" y2="90" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round"/>
      {/* Pontos da jornada */}
      {[
        { x: 60, label: 'Cadastro', done: true },
        { x: 110, label: 'Contato', done: true },
        { x: 160, label: 'Proposta', done: true },
        { x: 210, label: 'Contrato', done: false },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy="90" r="12" fill={p.done ? '#d97706' : '#f1f5f9'} stroke={p.done ? '#d97706' : '#e2e8f0'} strokeWidth="2"/>
          {p.done && <path d={`M ${p.x-5} 90 L ${p.x-1} 94 L ${p.x+6} 85`} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>}
          {/* Card acima/abaixo alternado */}
          <rect x={p.x-24} y={i%2===0 ? 50 : 108} width="48" height="26" rx="5" fill="#fff" stroke={p.done ? '#fcd34d' : '#e2e8f0'} strokeWidth="1.5"/>
          <text x={p.x} y={i%2===0 ? 67 : 125} textAnchor="middle" fill={p.done ? '#92400e' : '#94a3b8'} fontSize="8" fontWeight="700" fontFamily="sans-serif">{p.label}</text>
          {/* Linha conectando card ao ponto */}
          <line x1={p.x} y1={i%2===0 ? 76 : 108} x2={p.x} y2={i%2===0 ? 78 : 102} stroke={p.done ? '#fcd34d' : '#e2e8f0'} strokeWidth="1.5"/>
        </g>
      ))}
    </svg>
  )
}

/* ── Contrato ────────────────────────────────────────────────────── */
export function ContratoIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Papel do contrato */}
      <rect x="60" y="15" width="160" height="150" rx="8" fill="#fff" stroke="#e2e8f0" strokeWidth="2"/>
      <path d="M 60 35 L 220 35" stroke="#e2e8f0" strokeWidth="1"/>
      {/* Título */}
      <rect x="80" y="22" width="80" height="8" rx="2" fill="#0f172a"/>
      {/* Linhas de texto */}
      {[50,65,80,95].map((y) => (
        <rect key={y} x="78" y={y} width="124" height="7" rx="2" fill="#f1f5f9"/>
      ))}
      {/* Checklist */}
      {[115,130].map((y, i) => (
        <g key={y}>
          <rect x="78" y={y} width="10" height="10" rx="2" fill={i===0?'#d97706':'#f1f5f9'} stroke={i===0?'#d97706':'#e2e8f0'} strokeWidth="1.5"/>
          {i===0 && <path d={`M 80 ${y+5} L 83 ${y+7} L 87 ${y+2}`} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>}
          <rect x="94" y={y+1} width="80" height="7" rx="2" fill="#f1f5f9"/>
        </g>
      ))}
      {/* Assinatura */}
      <path d="M 78 162 Q 100 150 120 162 Q 140 174 160 162" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="78" y1="168" x2="160" y2="168" stroke="#e2e8f0" strokeWidth="1.5"/>
      {/* Selo */}
      <circle cx="195" cy="155" r="20" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2"/>
      <circle cx="195" cy="155" r="14" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 2"/>
      <text x="195" y="160" textAnchor="middle" fill="#d97706" fontSize="10" fontWeight="800">✓</text>
    </svg>
  )
}

/* ── Downloads ───────────────────────────────────────────────────── */
export function DownloadIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Pasta */}
      <rect x="40" y="60" width="200" height="110" rx="8" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2"/>
      <rect x="40" y="44" width="80" height="26" rx="6" fill="#fcd34d"/>
      {/* Documentos na pasta */}
      {[[70,80],[110,75],[150,80]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="50" height="70" rx="4" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5" transform={`rotate(${(i-1)*8} ${x+25} ${y+35})`}/>
      ))}
      {/* Seta de download */}
      <circle cx="195" cy="130" r="28" fill="#0f172a"/>
      <path d="M 195 118 L 195 134" stroke="#d97706" strokeWidth="3" strokeLinecap="round"/>
      <path d="M 186 128 L 195 138 L 204 128" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

/* ── Sobre ───────────────────────────────────────────────────────── */
export function SobreIllustration({ width = 280, style }: IllustrationProps) {
  return (
    <svg viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width, display: 'block', ...style }}>
      {/* Livro aberto */}
      <path d="M 140 40 L 50 55 L 50 155 L 140 140 Z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      <path d="M 140 40 L 230 55 L 230 155 L 140 140 Z" fill="#fff" stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="140" y1="40" x2="140" y2="140" stroke="#e2e8f0" strokeWidth="2"/>
      {/* Linhas de texto esquerda */}
      {[75,90,105,120,135].map(y => (
        <rect key={y} x="65" y={y} width="62" height="6" rx="2" fill="#e2e8f0"/>
      ))}
      {/* Linhas de texto direita */}
      {[75,90,105,120].map(y => (
        <rect key={y} x="153" y={y} width="62" height="6" rx="2" fill="#f1f5f9"/>
      ))}
      {/* Marcador */}
      <rect x="192" y="40" width="10" height="40" rx="3" fill="#d97706"/>
      <polygon points="192,80 197,90 202,80" fill="#d97706"/>
      {/* Ícone de informação */}
      <circle cx="75" cy="58" r="12" fill="#0f172a"/>
      <text x="75" y="63" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">i</text>
    </svg>
  )
}
