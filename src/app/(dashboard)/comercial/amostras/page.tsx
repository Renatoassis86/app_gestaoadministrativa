import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import { AmostrasKanban, type Amostra } from '@/components/comercial/AmostrasKanban'
import { SolicitarAmostraBtn } from '@/components/comercial/SolicitarAmostraBtn'
import { Package, Truck, CheckCircle2, MessageSquare, Send } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AmostrasPage() {
  const supabase = await createClient()

  const [{ data: amostras }, { data: escolas }] = await Promise.all([
    supabase
      .from('solicitacoes_amostras')
      .select(`
        *,
        escola:escolas(id, nome, cidade, estado),
        solicitante:profiles!solicitante_id(id, full_name),
        assistente:profiles!assistente_id(id, full_name)
      `)
      .order('solicitada_em', { ascending: false }),
    supabase
      .from('escolas')
      .select('id, nome, cidade, estado, cep, rua, numero, complemento, bairro, cnpj, contato_nome, telefone, email')
      .eq('ativa', true)
      .order('nome'),
  ])

  const list = (amostras ?? []) as Amostra[]

  // KPIs por estágio
  const kpis = [
    { label: 'Solicitadas', value: list.filter(a => a.stage === 'solicitada').length, icon: Send,         cor: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
    { label: 'Em Separação', value: list.filter(a => a.stage === 'separacao').length, icon: Package,      cor: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    { label: 'Postadas',    value: list.filter(a => a.stage === 'postada').length,    icon: Truck,        cor: '#0ea5e9', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Entregues',   value: list.filter(a => a.stage === 'entregue').length,   icon: CheckCircle2, cor: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
    { label: 'Devolutivas', value: list.filter(a => a.stage === 'devolutiva').length, icon: MessageSquare,cor: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
  ]

  return (
    <div>
      <PageHeader
        title="Envio de Amostras"
        subtitle="Fluxo operacional entre comercial e assistente administrativo — do pedido à devolutiva"
        actions={<SolicitarAmostraBtn escolas={escolas ?? []} />}
      />

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.85rem' }}>
          {kpis.map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} style={{
                background: k.bg, border: `1.5px solid ${k.border}`, borderTop: `3px solid ${k.cor}`,
                borderRadius: 12, padding: '.9rem 1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
                  <Icon size={14} color={k.cor} />
                  <div style={{ fontSize: '.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: k.cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                    {k.label}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {k.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Kanban */}
        {list.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12,
            padding: '3rem 2rem', textAlign: 'center',
          }}>
            <Package size={40} color="#cbd5e1" style={{ marginBottom: '.75rem' }} />
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '.4rem' }}>
              Nenhuma solicitação ainda
            </div>
            <p style={{ fontSize: '.85rem', color: '#64748b', maxWidth: 480, margin: '0 auto 1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
              A equipe comercial cria uma solicitação aqui. O assistente administrativo move o card pelas colunas conforme o envio progride. Ao final, o agente comercial registra a devolutiva da escola.
            </p>
            <SolicitarAmostraBtn escolas={escolas ?? []} />
          </div>
        ) : (
          <AmostrasKanban initial={list} />
        )}
      </div>
    </div>
  )
}
