import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { ClipboardList, FileText, Calendar, Building2 } from 'lucide-react'
import { PropostasList, type FormularioProposta } from '@/components/comercial/PropostasList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PropostaComercialPage() {
  const supabase = await createClient()
  const { data: formularios } = await supabase
    .from('formularios')
    .select('*')
    .order('data_envio', { ascending: false })

  const list = (formularios ?? []) as FormularioProposta[]

  // KPIs
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const inicioAno = new Date(hoje.getFullYear(), 0, 1).toISOString()
  const noMes = list.filter(f => f.data_envio >= inicioMes).length
  const noAno = list.filter(f => f.data_envio >= inicioAno).length
  const escolasUnicas = new Set(list.map(f => f.nome_escola?.trim().toLowerCase())).size

  const kpis = [
    { label: 'Total recebidas', value: list.length,     icon: FileText,    cor: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    { label: 'Este mês',        value: noMes,           icon: Calendar,    cor: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    { label: 'Este ano',        value: noAno,           icon: Calendar,    cor: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Escolas únicas',  value: escolasUnicas,   icon: Building2,   cor: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
  ]

  return (
    <div>
      <PageHeader
        title="Dados da Proposta Comercial"
        subtitle="Formulários preenchidos pelas escolas para iniciar a parceria com o Currículo Paideia"
        actions={
          <Link href="/formulario" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem 1rem',
            borderRadius: 9999, background: '#d97706', color: '#fff', textDecoration: 'none',
            fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)',
            boxShadow: '0 4px 12px rgba(217,119,6,.3)',
          }}>
            <ClipboardList size={13} /> Ver Formulário Público
          </Link>
        }
      />

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.85rem' }}>
          {kpis.map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} style={{
                background: k.bg, border: `1.5px solid ${k.border}`, borderTop: `3px solid ${k.cor}`,
                borderRadius: 12, padding: '1rem 1.1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem' }}>
                  <Icon size={14} color={k.cor} />
                  <div style={{ fontSize: '.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: k.cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                    {k.label}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {k.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Lista + busca + modal */}
        <PropostasList formularios={list} />
      </div>
    </div>
  )
}
