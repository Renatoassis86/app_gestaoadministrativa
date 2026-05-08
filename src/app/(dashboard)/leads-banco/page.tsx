import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { LeadsTable } from '@/components/leads/LeadsTable'

interface Props {
  searchParams: Promise<{ q?: string; fonte?: string; tipo?: string; uf?: string; pagina?: string }>
}

const POR_PAGINA = 50

const FONTE_OPTS = [
  { value: '',           label: 'Todas as fontes' },
  { value: 'ciecc_2025', label: '1º CIECC 2025' },
  { value: 'ciecc_2026', label: '2º CIECC 2026' },
  { value: 'crm',        label: 'CRM Education' },
  { value: 'oikos',      label: 'Oikos Live' },
  { value: 'outro',      label: 'Outro' },
]

const TIPO_OPTS = [
  { value: '',            label: 'Todos os tipos' },
  { value: 'decisores',   label: 'Só Decisores (gestor/diretor/mantenedor/coordenador)' },
  { value: 'gestores',    label: 'Só Gestores' },
  { value: 'diretores',   label: 'Só Diretores' },
  { value: 'mantenedores',label: 'Só Mantenedores' },
]

export default async function LeadsBancoPage({ searchParams }: Props) {
  const params  = await searchParams
  const q       = params.q      ?? ''
  const fonte   = params.fonte  ?? ''
  const tipo    = params.tipo   ?? ''
  const uf      = params.uf     ?? ''
  const pagina  = Math.max(1, parseInt(params.pagina ?? '1'))
  const offset  = (pagina - 1) * POR_PAGINA

  const supabase = await createClient()

  // Verificar se tabela existe
  const { error: tabelaErr } = await supabase.from('leads_universal').select('id').limit(1)
  const tabelaOk = tabelaErr?.code !== 'PGRST205'

  if (!tabelaOk) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <PageHeader title="Banco de Leads" subtitle="Leads importados dos congressos e CRM" />
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '3rem', maxWidth: 520, margin: '0 auto' }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '.5rem' }}>Banco não configurado</h3>
            <p style={{ fontSize: '.875rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', marginBottom: '1.5rem' }}>Execute o SQL e depois importe os dados.</p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
              <a href="https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new" target="_blank" rel="noopener noreferrer" style={{ background: '#d97706', color: '#fff', padding: '.6rem 1.5rem', borderRadius: 9999, textDecoration: 'none', fontWeight: 700, fontSize: '.82rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Criar tabelas (SQL)
              </a>
              <Link href="/importacao" style={{ border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', padding: '.6rem 1.5rem', borderRadius: 9999, textDecoration: 'none', fontWeight: 600, fontSize: '.82rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Importar dados
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Montar query com filtros
  let query = supabase
    .from('leads_universal')
    .select('id,fonte,nome,email,tel_celular,cidade,uf,tipo_inscricao,cargo,escola_nome,escola_cnpj,lote,data_inscricao,dados_extras', { count: 'exact' })
    .order('nome')
    .range(offset, offset + POR_PAGINA - 1)

  if (q)     query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%,escola_nome.ilike.%${q}%`)
  if (fonte) query = query.eq('fonte', fonte)
  if (uf)    query = query.eq('uf', uf.toUpperCase())

  // Filtro por tipo — ignorado para CRM (todos são representantes de escolas)
  const isCRM = fonte === 'crm'
  if (!isCRM) {
    if (tipo === 'decisores')    query = query.or('tipo_inscricao.ilike.%gestor%,tipo_inscricao.ilike.%diretor%,tipo_inscricao.ilike.%mantenedor%,tipo_inscricao.ilike.%coordenador%')
    else if (tipo === 'gestores')     query = query.ilike('tipo_inscricao', '%gestor%')
    else if (tipo === 'diretores')    query = query.ilike('tipo_inscricao', '%diretor%')
    else if (tipo === 'mantenedores') query = query.ilike('tipo_inscricao', '%mantenedor%')
  }

  const { data: leads, count } = await query
  const total        = count ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  // KPIs gerais (sem filtros)
  const [
    { count: totalGeral },
    { count: totalDecisores },
    { count: totalComEmail },
    { count: total2025 },
    { count: total2026 },
  ] = await Promise.all([
    supabase.from('leads_universal').select('*', { count: 'exact', head: true }),
    supabase.from('leads_universal').select('*', { count: 'exact', head: true })
      .or('tipo_inscricao.ilike.%gestor%,tipo_inscricao.ilike.%diretor%,tipo_inscricao.ilike.%mantenedor%,tipo_inscricao.ilike.%coordenador%'),
    supabase.from('leads_universal').select('*', { count: 'exact', head: true }).not('email', 'is', null),
    supabase.from('leads_universal').select('*', { count: 'exact', head: true }).eq('fonte', 'ciecc_2025'),
    supabase.from('leads_universal').select('*', { count: 'exact', head: true }).eq('fonte', 'ciecc_2026'),
  ])

  // UFs para filtro
  const { data: ufsData } = await supabase.from('leads_universal').select('uf').not('uf', 'is', null).limit(3000)
  const ufsUnicas = [...new Set(ufsData?.map(r => r.uf).filter(Boolean) ?? [])].sort()

  const buildUrl = (p: Record<string, string>) => {
    const params = new URLSearchParams({ q, fonte, tipo, uf, pagina: '1', ...p })
    return `/leads-banco?${params.toString()}`
  }

  // URL de exportação com os filtros aplicados
  const exportUrl = `/api/leads-export?${new URLSearchParams({ q, fonte, tipo, uf }).toString()}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader
        title="Banco de Leads"
        subtitle={`${(totalGeral ?? 0).toLocaleString('pt-BR')} leads importados`}
        actions={
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {/* Exportar Excel */}
            <a href={exportUrl} style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              padding: '.45rem 1rem', borderRadius: 9999,
              background: '#16a34a', color: '#fff', textDecoration: 'none',
              fontSize: '.78rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              boxShadow: '0 4px 12px rgba(22,163,74,.3)',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Baixar Excel
            </a>
            {/* Importar */}
            <Link href="/importacao" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              padding: '.45rem 1rem', borderRadius: 9999,
              background: '#d97706', color: '#fff', textDecoration: 'none',
              fontSize: '.78rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              boxShadow: '0 4px 12px rgba(217,119,6,.3)',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              Importar Dados
            </Link>
          </div>
        }
      />

      <div style={{ padding: '1.5rem 1.75rem' }}>

        {/* ── KPIs ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: '.85rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total de Leads',   val: (totalGeral ?? 0).toLocaleString('pt-BR'),     cor: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' },
            { label: 'Decisores',        val: (totalDecisores ?? 0).toLocaleString('pt-BR'),  cor: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
            { label: 'Com E-mail',       val: (totalComEmail ?? 0).toLocaleString('pt-BR'),   cor: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            { label: '1º CIECC 2025',    val: (total2025 ?? 0).toLocaleString('pt-BR'),       cor: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
            { label: '2º CIECC 2026',    val: (total2026 ?? 0).toLocaleString('pt-BR'),       cor: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderTop: `3px solid ${k.cor}`, borderRadius: 14, padding: '.9rem 1rem', minWidth: 0 }}>
              <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: k.cor, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* ── Filtros ──────────────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(15,23,42,.04)' }}>

          {/* Busca */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <form method="get" action="/leads-banco" style={{ display: 'contents' }}>
              <input name="q" defaultValue={q} placeholder="Buscar por nome, e-mail ou escola..." style={{ width: '100%', padding: '.6rem .85rem .6rem 2.1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)', outline: 'none', background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box' as const }} />
              <input type="hidden" name="fonte" value={fonte} />
              <input type="hidden" name="tipo" value={tipo} />
              <input type="hidden" name="uf" value={uf} />
            </form>
          </div>

          {/* Fonte */}
          <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>Fonte:</span>
            {FONTE_OPTS.map(f => (
              <a key={f.value} href={buildUrl({ fonte: f.value })} style={{
                padding: '.3rem .65rem', borderRadius: 7, textDecoration: 'none',
                fontSize: '.68rem', fontWeight: fonte === f.value ? 700 : 400,
                background: fonte === f.value ? '#0f172a' : '#f1f5f9',
                color: fonte === f.value ? '#fff' : '#475569',
                fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap',
              }}>{f.label}</a>
            ))}
          </div>

          {/* Tipo */}
          <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>Tipo:</span>
            {TIPO_OPTS.map(t => (
              <a key={t.value} href={buildUrl({ tipo: t.value })} style={{
                padding: '.3rem .65rem', borderRadius: 7, textDecoration: 'none',
                fontSize: '.68rem', fontWeight: tipo === t.value ? 700 : 400,
                background: tipo === t.value ? '#dc2626' : '#f1f5f9',
                color: tipo === t.value ? '#fff' : '#475569',
                fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap',
                maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block',
              }}>{t.label}</a>
            ))}
          </div>

          {/* UF */}
          {ufsUnicas.length > 0 && (
            <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>Estado:</span>
              <a href={buildUrl({ uf: '' })} style={{ padding: '.3rem .65rem', borderRadius: 7, textDecoration: 'none', fontSize: '.68rem', fontWeight: !uf ? 700 : 400, background: !uf ? '#0f172a' : '#f1f5f9', color: !uf ? '#fff' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>Todos</a>
              {ufsUnicas.slice(0, 12).map(u => (
                <a key={u} href={buildUrl({ uf: u })} style={{ padding: '.3rem .6rem', borderRadius: 7, textDecoration: 'none', fontSize: '.68rem', fontWeight: uf === u ? 700 : 400, background: uf === u ? '#d97706' : '#f1f5f9', color: uf === u ? '#fff' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>{u}</a>
              ))}
            </div>
          )}

          {/* Resultado */}
          {(q || fonte || tipo || uf) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginLeft: 'auto', flexShrink: 0 }}>
              <span style={{ fontSize: '.72rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                <strong style={{ color: '#0f172a' }}>{total.toLocaleString('pt-BR')}</strong> resultado{total !== 1 ? 's' : ''}
              </span>
              <a href="/leads-banco" style={{ fontSize: '.65rem', color: '#dc2626', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', background: '#fef2f2', border: '1px solid #fca5a5', padding: '.2rem .5rem', borderRadius: 6 }}>
                Limpar
              </a>
            </div>
          )}
        </div>

        {/* ── Tabela ───────────────────────────────────────── */}
        <LeadsTable
          leads={(leads ?? []) as any}
          total={total}
          pagina={pagina}
          totalPaginas={totalPaginas}
          q={q}
          fonte={fonte}
          tipo={tipo}
          uf={uf}
        />

      </div>
    </div>
  )
}
