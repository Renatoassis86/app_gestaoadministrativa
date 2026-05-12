import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Check, ChevronRight } from 'lucide-react'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function RegistroSucessoPage({ searchParams }: Props) {
  const params = await searchParams
  const registroId = params.id

  if (!registroId) redirect('/comercial/registros')

  const supabase = await createClient()

  // Validar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  console.log('📝 [RegistroSucessoPage] Carregando registro:', registroId, 'para user:', user.email)

  // Buscar os dados do registro que foi salvo
  // IMPORTANTE: Usar RLS com usuario autenticado
  const { data: registro, error } = await supabase
    .from('registros')
    .select(`
      id,
      escola_id,
      data_contato,
      hora_contato,
      meio_contato,
      responsavel_id,
      contato_nome,
      contato_cargo,
      resumo,
      notas_internas,
      interesse,
      prontidao,
      abertura,
      encaminhamentos,
      qtd_infantil,
      qtd_fund1,
      qtd_fund2,
      qtd_medio,
      proximo_contato,
      potencial_financeiro,
      probabilidade,
      classificacao,
      created_by,
      created_at,
      updated_at,
      escola:escolas(id,nome,cidade,estado)
    `)
    .eq('id', registroId)
    .single()

  if (error) {
    console.error('❌ Erro ao buscar registro:', error.message)
    console.error('Detalhes:', error)
    // Em vez de redirecionar silenciosamente, mostrar o erro
    redirect(`/comercial/registros?error=Não foi possível carregar o registro. Tente novamente.`)
  }

  if (!registro) {
    console.warn('⚠️ Registro não encontrado:', registroId)
    redirect('/comercial/registros?error=Registro não encontrado')
  }

  console.log('✅ Registro carregado com sucesso:', registroId)

  const CLASSIF_COR: Record<string, { bg: string; text: string; dot: string }> = {
    quente: { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
    morno:  { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
    frio:   { bg: '#eff6ff', text: '#2563eb', dot: '#60a5fa' },
  }

  const cor = CLASSIF_COR[registro.classificacao ?? 'frio'] ?? CLASSIF_COR.frio

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header de sucesso */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          paddingTop: '1rem',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 12px rgba(16,185,129,.3)',
          }}>
            <Check size={40} color="#fff" strokeWidth={3} />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: '#10b981',
            margin: '0 0 .5rem',
            fontFamily: 'var(--font-montserrat,sans-serif)',
          }}>
            Registro Salvo com Sucesso!
          </h1>
          <p style={{
            fontSize: '.95rem',
            color: '#64748b',
            margin: 0,
            fontFamily: 'var(--font-inter,sans-serif)',
          }}>
            Sua interação comercial foi registrada no sistema
          </p>
        </div>

        {/* Card com detalhes do registro */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(15,23,42,.05)',
          marginBottom: '2rem',
        }}>
          {/* Header da escola */}
          <div style={{
            padding: '1.5rem',
            background: '#f0f9ff',
            borderBottom: '1px solid #e2e8f0',
          }}>
            <h2 style={{
              margin: '0 0 .25rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              fontFamily: 'var(--font-montserrat,sans-serif)',
            }}>
              {(registro.escola as any)?.nome}
            </h2>
            <p style={{
              margin: 0,
              fontSize: '.85rem',
              color: '#475569',
              fontFamily: 'var(--font-inter,sans-serif)',
            }}>
              {(registro.escola as any)?.cidade}{(registro.escola as any)?.estado ? `, ${(registro.escola as any).estado}` : ''}
            </p>
          </div>

          {/* Detalhes */}
          <div style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              {/* Data do contato */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: '#64748b',
                  marginBottom: '.35rem',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  Data do Contato
                </label>
                <div style={{
                  fontSize: '.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  {formatDate(registro.data_contato)}
                </div>
              </div>

              {/* Meio do contato */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: '#64748b',
                  marginBottom: '.35rem',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  Meio do Contato
                </label>
                <div style={{
                  fontSize: '.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  textTransform: 'capitalize',
                  fontFamily: 'var(--font-inter,sans-serif)',
                }}>
                  {registro.meio_contato}
                </div>
              </div>

              {/* Contato */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: '#64748b',
                  marginBottom: '.35rem',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  Contato na Escola
                </label>
                <div style={{
                  fontSize: '.95rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'var(--font-inter,sans-serif)',
                }}>
                  {registro.contato_nome || '—'}
                </div>
                {registro.contato_cargo && (
                  <div style={{
                    fontSize: '.8rem',
                    color: '#64748b',
                    marginTop: '.1rem',
                  }}>
                    ({registro.contato_cargo})
                  </div>
                )}
              </div>

              {/* Classificação */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  color: '#64748b',
                  marginBottom: '.35rem',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  Status
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.3rem',
                  background: cor.bg,
                  color: cor.text,
                  padding: '.25rem .6rem',
                  borderRadius: 99,
                  fontSize: '.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: cor.dot, display: 'inline-block' }} />
                  {registro.classificacao === 'quente' ? 'Quente' : registro.classificacao === 'morno' ? 'Morno' : 'Frio'}
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}>
              <label style={{
                display: 'block',
                fontSize: '.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                color: '#64748b',
                marginBottom: '.5rem',
                fontFamily: 'var(--font-montserrat,sans-serif)',
              }}>
                Resumo da Conversa
              </label>
              <p style={{
                margin: 0,
                fontSize: '.9rem',
                color: '#334155',
                lineHeight: 1.6,
                fontFamily: 'var(--font-inter,sans-serif)',
                whiteSpace: 'pre-wrap',
              }}>
                {registro.resumo}
              </p>
            </div>

            {/* Indicadores */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e2e8f0',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Interesse</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#0f172a', textTransform: 'capitalize', fontFamily: 'var(--font-inter,sans-serif)' }}>{registro.interesse}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Prontidão</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#0f172a', textTransform: 'capitalize', fontFamily: 'var(--font-inter,sans-serif)' }}>{registro.prontidao}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Potencial</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)' }}>R$ {registro.potencial_financeiro?.toLocaleString('pt-BR') ?? '0'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column',
        }}>
          <Link href={`/comercial/escolas/${registro.escola_id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
              padding: '1rem 1.5rem',
              background: '#d97706',
              color: '#fff',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              fontSize: '.9rem',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#b45309')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#d97706')}
          >
            Ver Detalhes da Escola <ChevronRight size={16} />
          </Link>

          <Link href="/comercial/registros"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
              padding: '1rem 1.5rem',
              background: '#f1f5f9',
              color: '#475569',
              border: '1.5px solid #e2e8f0',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              fontSize: '.9rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          >
            ← Voltar para Registros
          </Link>
        </div>
      </div>
    </div>
  )
}
