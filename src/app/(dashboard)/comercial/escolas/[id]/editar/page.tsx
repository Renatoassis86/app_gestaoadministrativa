import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { upsertEscola } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { PERFIL_OPTIONS, ORIGEM_OPTIONS, CARGO_CONTATO_OPTIONS } from '@/types/database'
import { CheckboxPaideia } from '@/components/ui/CheckboxPaideia'

interface Props { params: Promise<{ id: string }> }

export default async function EscolaEditar({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: escola }, { data: profiles }] = await Promise.all([
    supabase.from('escolas').select('*').eq('id', id).single(),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
  ])

  if (!escola) notFound()
  const e = escola as any

  return (
    <div>
      <PageHeader title={`Editar: ${e.nome}`} />
      <div className="p-6 max-w-4xl">
        <div className="breadcrumb mb-4">
          <Link href="/comercial/escolas">Escolas</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/comercial/escolas/${id}`}>{e.nome}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Editar</span>
        </div>

        <form action={upsertEscola}>
          <input type="hidden" name="id" value={id} />

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Identificação</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Nome da Escola *</label>
                  <input name="nome" className="form-control" defaultValue={e.nome} required />
                </div>
                <div>
                  <label className="form-label">CNPJ</label>
                  <input name="cnpj" className="form-control" defaultValue={e.cnpj ?? ''} />
                </div>
                <div>
                  <label className="form-label">Perfil Pedagógico</label>
                  <select name="perfil_pedagogico" className="form-control" defaultValue={e.perfil_pedagogico}>
                    {PERFIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <CheckboxPaideia defaultChecked={e.escola_paideia ?? false} />
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Endereço</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Rua</label>
                  <input name="rua" className="form-control" defaultValue={e.rua ?? ''} />
                </div>
                <div>
                  <label className="form-label">Número</label>
                  <input name="numero" className="form-control" defaultValue={e.numero ?? ''} />
                </div>
                <div>
                  <label className="form-label">Complemento</label>
                  <input name="complemento" className="form-control" defaultValue={e.complemento ?? ''} />
                </div>
                <div>
                  <label className="form-label">Bairro</label>
                  <input name="bairro" className="form-control" defaultValue={e.bairro ?? ''} />
                </div>
                <div>
                  <label className="form-label">CEP</label>
                  <input name="cep" className="form-control" defaultValue={e.cep ?? ''} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Cidade</label>
                  <input name="cidade" className="form-control" defaultValue={e.cidade ?? ''} />
                </div>
                <div>
                  <label className="form-label">Estado (UF)</label>
                  <input name="estado" className="form-control" maxLength={2} defaultValue={e.estado ?? ''} style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Contato</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div><label className="form-label">Telefone</label><input name="telefone" className="form-control" defaultValue={e.telefone ?? ''} /></div>
                <div><label className="form-label">E-mail</label><input name="email" type="email" className="form-control" defaultValue={e.email ?? ''} /></div>
                <div><label className="form-label">Site</label><input name="site" className="form-control" defaultValue={e.site ?? ''} /></div>
                <div><label className="form-label">Nome do Contato</label><input name="contato_nome" className="form-control" defaultValue={e.contato_nome ?? ''} /></div>
                <div>
                  <label className="form-label">Cargo do Contato</label>
                  <select name="contato_cargo" className="form-control" defaultValue={e.contato_cargo ?? ''}>
                    <option value="">Selecione...</option>
                    {CARGO_CONTATO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Nome do Diretor</label><input name="diretor_nome" className="form-control" defaultValue={e.diretor_nome ?? ''} /></div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Quantidade de Alunos por Segmento</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                {[
                  { name: 'qtd_infantil', label: 'Ed. Infantil',   sub: 'Inf. 2 ao Inf. 5', cor: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
                  { name: 'qtd_fund1',    label: 'Fund. I',        sub: '1º ao 5º Ano',     cor: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                  { name: 'qtd_fund2',    label: 'Fund. II',       sub: '6º ao 9º Ano',     cor: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                  { name: 'qtd_medio',    label: 'Ens. Médio',     sub: '1ª à 3ª Série',    cor: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
                ].map(seg => (
                  <div key={seg.name} style={{ background: seg.bg, border: `1.5px solid ${seg.border}`, borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                    <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: seg.cor, marginBottom: '.5rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      {seg.label}
                    </label>
                    <input name={seg.name} type="number" min="0"
                      style={{ width: '100%', padding: '.6rem', textAlign: 'center', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 800, border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', boxSizing: 'border-box' as const, color: '#0f172a' }}
                      defaultValue={(e as any)[seg.name] ?? 0} />
                    <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.35rem', fontFamily: 'var(--font-inter,sans-serif)' }}>{seg.sub}</div>
                  </div>
                ))}
              </div>
              {/* Hidden fields para compatibilidade com a action */}
              {(['qtd_fund1_ano1','qtd_fund1_ano2','qtd_fund1_ano3','qtd_fund1_ano4','qtd_fund1_ano5',
                 'qtd_fund2_ano6','qtd_fund2_ano7','qtd_fund2_ano8','qtd_fund2_ano9',
                 'qtd_medio_1s','qtd_medio_2s','qtd_medio_3s'] as const).map(f => (
                <input key={f} type="hidden" name={f} value={(e as any)[f] ?? 0} />
              ))}
            </div>
          </div>

          <div className="card mb-6">
            <div className="card-header"><span className="card-title">Gestão Comercial</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Origem do Lead</label>
                  <select name="origem_lead" className="form-control" defaultValue={e.origem_lead ?? ''}>
                    <option value="">Selecione...</option>
                    {ORIGEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Responsável Comercial</label>
                  <select name="responsavel_id" className="form-control" defaultValue={e.responsavel_id ?? ''}>
                    <option value="">Selecione...</option>
                    {profiles?.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Observações</label>
                <textarea name="observacoes" className="form-control" rows={3} defaultValue={e.observacoes ?? ''} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            <Link href={`/comercial/escolas/${id}`} className="btn btn-ghost">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
