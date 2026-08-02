'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts'

interface BarDatum { label: string; quantidade: number }

const CHART_HUE = '#d97706'

function BarraHorizontal({ titulo, subtitulo, dados, altura, cor }: { titulo: string; subtitulo?: string; dados: BarDatum[]; altura: number; cor?: string }) {
  if (dados.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)', minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#475569', marginBottom: '.4rem' }}>
          {titulo}
        </div>
        <div style={{ fontSize: '.75rem', color: '#94a3b8', padding: '1.5rem 0', textAlign: 'center' }}>Sem dados ainda</div>
      </div>
    )
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)', minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#475569' }}>
        {titulo}
      </div>
      {subtitulo && <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.15rem', marginBottom: '.7rem' }}>{subtitulo}</div>}
      {!subtitulo && <div style={{ marginBottom: '.85rem' }} />}
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="label" width={140}
            tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}
            axisLine={{ stroke: '#e2e8f0' }} tickLine={false}
          />
          <Tooltip
            cursor={{ fill: `${cor ?? CHART_HUE}0f` }}
            contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'var(--font-inter,sans-serif)', boxShadow: '0 4px 16px rgba(15,23,42,.08)' }}
            formatter={(value: any) => [`${value} escola${value === 1 ? '' : 's'}`, '']}
            labelFormatter={(label: any) => label}
          />
          <Bar dataKey="quantidade" fill={cor ?? CHART_HUE} radius={[0, 4, 4, 0]} maxBarSize={18}>
            <LabelList dataKey="quantidade" position="right" style={{ fontSize: 11, fill: '#334155', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PriorizacaoCharts({
  porEstado, porPerfil, porEstagio, porConfessionalidade,
}: {
  porEstado: { estado: string; quantidade: number }[]
  porPerfil: { label: string; quantidade: number }[]
  porEstagio: { estagio: string; quantidade: number }[]
  porConfessionalidade: { label: string; quantidade: number }[]
}) {
  const dadosEstado = porEstado.map(d => ({ label: d.estado, quantidade: d.quantidade }))
  const dadosPerfil = porPerfil.map(d => ({ label: d.label, quantidade: d.quantidade }))
  const dadosEstagio = porEstagio.map(d => ({ label: d.estagio, quantidade: d.quantidade }))
  const dadosConfessionalidade = porConfessionalidade.map(d => ({ label: d.label, quantidade: d.quantidade }))
  const totalConfessionalidade = dadosConfessionalidade.reduce((a, b) => a + b.quantidade, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '1.25rem' }}>
      <BarraHorizontal titulo="Escolas por UF (top 10)" dados={dadosEstado} altura={Math.max(dadosEstado.length * 28, 140)} />
      <BarraHorizontal
        titulo="Confessionalidade cristã (pesquisa CIECC)"
        subtitulo={`Resposta real de ${totalConfessionalidade} escola${totalConfessionalidade === 1 ? '' : 's'} — as demais ainda não responderam`}
        dados={dadosConfessionalidade} altura={Math.max(dadosConfessionalidade.length * 28, 140)} cor="#7c3aed"
      />
      <BarraHorizontal titulo="Escolas por perfil pedagógico" subtitulo="Somente quando confirmado — sem inferir a partir da confessionalidade" dados={dadosPerfil} altura={Math.max(dadosPerfil.length * 28, 140)} />
      <BarraHorizontal titulo="Escolas por estágio no funil" dados={dadosEstagio} altura={Math.max(dadosEstagio.length * 28, 140)} />
    </div>
  )
}
