import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { ClipboardList, Globe, FileText, Calendar, Building2 } from 'lucide-react'
import { PropostasList, type FormularioProposta, type FormularioBilinguismo } from '@/components/comercial/PropostasList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PropostaComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const params = await searchParams
  const abaInicial = params.tipo === 'bilinguismo' ? 'bilinguismo' : 'paideia'

  const supabase = await createClient()

  const [resPaideia, resBilinguismo] = await Promise.all([
    supabase.from('formularios').select('*').order('data_envio', { ascending: false }),
    supabase.from('formularios_bilinguismo').select('*').order('data_envio', { ascending: false }),
  ])

  const listPaideia = (resPaideia.data ?? []) as FormularioProposta[]
  const listBilinguismo = (resBilinguismo.data ?? []) as FormularioBilinguismo[]

  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const inicioAno = new Date(hoje.getFullYear(), 0, 1).toISOString()

  // KPIs específicos do tipo selecionado
  const listaAtiva = abaInicial === 'bilinguismo' ? listBilinguismo : listPaideia
  const totalGeral = listaAtiva.length
  const noMes = listaAtiva.filter(f => f.data_envio >= inicioMes).length
  const noAno = listaAtiva.filter(f => f.data_envio >= inicioAno).length
  const nomesEscolas = listaAtiva.map(f => f.nome_escola?.trim().toLowerCase()).filter(Boolean)
  const escolasUnicas = new Set(nomesEscolas).size

  const kpis = [
    { label: `Total ${abaInicial === 'bilinguismo' ? 'Bilinguismo' : 'Paideia'}`, value: totalGeral, icon: FileText, cor: abaInicial === 'bilinguismo' ? '#0284c7' : '#d97706', bg: abaInicial === 'bilinguismo' ? '#f0f9ff' : '#fffbeb', border: abaInicial === 'bilinguismo' ? '#bae6fd' : '#fcd34d' },
    { label: 'Este mês',        value: noMes,           icon: Calendar,    cor: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    { label: 'Este ano',        value: noAno,           icon: Calendar,    cor: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Escolas únicas',  value: escolasUnicas,   icon: Building2,   cor: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
  ]

  return (
    <div>
      <PageHeader
        title={abaInicial === 'bilinguismo' ? 'Dados das Propostas — Parceria de Bilinguismo' : 'Dados das Propostas — Currículo Paideia'}
        subtitle={abaInicial === 'bilinguismo' ? 'Formulários de implantação do departamento de inglês preenchidos pelas escolas' : 'Formulários do Currículo Paideia preenchidos pelas escolas'}
        actions={
          <div style={{ display: 'flex', gap: '.65rem', alignItems: 'center' }}>
            <Link
              href="/formulario"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem 1rem',
                borderRadius: 9999, background: '#d97706', color: '#fff', textDecoration: 'none',
                fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)',
                boxShadow: '0 4px 12px rgba(217,119,6,.3)',
              }}
            >
              <ClipboardList size={13} /> Formulário Paideia
            </Link>

            <Link
              href="/formulario-ingles"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem 1rem',
                borderRadius: 9999, background: 'linear-gradient(135deg, #0284c7, #4f46e5)', color: '#fff', textDecoration: 'none',
                fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)',
                boxShadow: '0 4px 12px rgba(2,132,199,.3)',
              }}
            >
              <Globe size={13} /> Formulário Bilinguismo
            </Link>
          </div>
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

        {/* Lista de propostas com alternância de abas */}
        <PropostasList
          formularios={listPaideia}
          formulariosBilinguismo={listBilinguismo}
          abaInicial={abaInicial}
        />
      </div>
    </div>
  )
}
