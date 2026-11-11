'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { salvarContrato } from '@/lib/contratos-actions'
import { MODALIDADES, STATUS_CONTRATO, SERIES_CONTRATO, brl, fmtCnpj, soDigitos, type Modalidade } from '@/lib/contratos'

export interface EscolaOpcao { id: string; nome: string; cnpj: string | null }
export interface FormInicial {
  escolaId: string | null
  escola: Record<string, any>
  contrato: Record<string, any>
  series: Array<{ serie: string; tipo_kit: string; quantidade: number; valor_unitario: number | null; curriculo?: string | null }>
}

const inp: React.CSSProperties = { width: '100%', padding: '.5rem .7rem', fontSize: '.85rem', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }
const lab: React.CSSProperties = { display: 'block', fontSize: '.76rem', fontWeight: 600, color: '#475569', marginBottom: '.25rem' }

function Sec({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.2rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#0ea5e9', borderBottom: '2px solid #0ea5e9', paddingBottom: '.35rem', marginBottom: '.9rem' }}>{titulo}</h2>
      {children}
    </section>
  )
}
const Grid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '.8rem', marginBottom: '.8rem' }}>{children}</div>
)
function F({ l, n, v, t = 'text', ph, req }: { l: string; n: string; v?: any; t?: string; ph?: string; req?: boolean }) {
  return (
    <div>
      <label style={lab} htmlFor={n}>{l}{req && ' *'}</label>
      <input id={n} name={n} type={t} defaultValue={v ?? ''} placeholder={ph} required={req} style={inp} step={t === 'number' ? 'any' : undefined} />
    </div>
  )
}

export function ContratoForm({ modo, escolas, inicial }: { modo: 'novo' | 'editar'; escolas: EscolaOpcao[]; inicial: FormInicial }) {
  const router = useRouter()
  const [pendente, start] = useTransition()
  const [erro, setErro] = useState('')
  const c = inicial.contrato, e = inicial.escola

  const [escolaId, setEscolaId] = useState<string>(inicial.escolaId ?? '')
  const [cnpjNovo, setCnpjNovo] = useState('')
  const [modalidade, setModalidade] = useState<Modalidade | ''>((c.modalidade as Modalidade) ?? '')
  const [valorTotal, setValorTotal] = useState<string>(c.valor_total != null ? String(c.valor_total) : '')
  const [linhas, setLinhas] = useState(
    inicial.series.map(s => ({ serie: s.serie, tipo_kit: s.tipo_kit, quantidade: s.quantidade, valor_unitario: s.valor_unitario, curriculo: s.curriculo ?? '' })),
  )

  const duplicado = useMemo(() => {
    const d = soDigitos(cnpjNovo)
    return d.length === 14 ? escolas.find(x => soDigitos(x.cnpj) === d) : undefined
  }, [cnpjNovo, escolas])

  const calc = linhas.reduce((a, l) => a + (l.quantidade || 0) * (l.valor_unitario || 0), 0)
  const kits = linhas.reduce((a, l) => a + (l.quantidade || 0), 0)
  const informado = valorTotal ? Number(valorTotal.replace(/\./g, '').replace(',', '.')) : null
  const diverge = informado != null && linhas.length > 0 && Math.abs(informado - calc) > 0.005

  const setLinha = (i: number, patch: Partial<typeof linhas[number]>) =>
    setLinhas(ls => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)))
  const todasSeries = () => setLinhas(ls => [
    ...ls,
    ...SERIES_CONTRATO.filter(s => !ls.some(l => l.serie === s.id && l.tipo_kit === 'completo'))
      .map(s => ({ serie: s.id, tipo_kit: 'completo', quantidade: 0, valor_unitario: null as number | null, curriculo: '' })),
  ])

  function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    setErro('')
    const fd = new FormData(ev.currentTarget)
    fd.set('series_json', JSON.stringify(linhas.map(l => ({ ...l, curriculo: l.curriculo || (l.serie.startsWith('infantil') ? 'Paideia Infantil' : 'Paideia Fundamental') }))))
    start(async () => {
      const r = await salvarContrato(fd)
      if (!r.ok) { setErro(r.error ?? 'Erro ao salvar.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
      router.push('/contratos/escolas'); router.refresh()
    })
  }

  const nova = modo === 'novo' && !escolaId

  return (
    <form onSubmit={enviar} style={{ maxWidth: 980 }}>
      {erro && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '.7rem .9rem', fontSize: '.85rem', marginBottom: '1rem' }}>{erro}</div>}

      <Sec titulo="Escola (contratante)">
        {modo === 'novo' ? (
          <div style={{ marginBottom: '.8rem' }}>
            <label style={lab} htmlFor="escola_id">Escola já cadastrada no CRM</label>
            <select id="escola_id" name="escola_id" value={escolaId} onChange={ev => setEscolaId(ev.target.value)} style={inp}>
              <option value="">— Cadastrar escola nova —</option>
              {escolas.map(x => <option key={x.id} value={x.id}>{x.nome}{x.cnpj ? ` · ${fmtCnpj(x.cnpj)}` : ''}</option>)}
            </select>
          </div>
        ) : <input type="hidden" name="escola_id" value={inicial.escolaId ?? ''} />}

        <Grid>
          <F l="Razão social" n="razao_social" v={e.razao_social} req={nova} />
          <F l="Nome fantasia" n="nome_fantasia" v={e.nome_fantasia} />
          <div>
            <label style={lab} htmlFor="cnpj">CNPJ{nova && ' *'}</label>
            <input id="cnpj" name="cnpj" defaultValue={e.cnpj ? fmtCnpj(e.cnpj) : ''} onChange={ev => nova && setCnpjNovo(ev.target.value)} style={inp} required={nova} placeholder="00.000.000/0000-00" />
          </div>
          <F l="CNAE" n="cnae" v={e.cnae} />
          <F l="Registro MEC (se aplicável)" n="registro_mec" v={e.registro_mec} />
        </Grid>
        {nova && duplicado && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '.5rem .7rem', fontSize: '.8rem', color: '#92400e', marginBottom: '.8rem' }}>
            Já existe uma escola com este CNPJ: <strong>{duplicado.nome}</strong>. Selecione-a na lista acima em vez de criar outra.
          </div>
        )}
        <Grid>
          <F l="Rua" n="rua" v={e.rua} /><F l="Número" n="numero" v={e.numero} /><F l="Complemento" n="complemento" v={e.complemento} />
          <F l="Bairro" n="bairro" v={e.bairro} /><F l="Cidade" n="cidade" v={e.cidade?.trim()} /><F l="UF" n="estado" v={e.estado} ph="SP" />
          <F l="CEP" n="cep" v={e.cep} />
        </Grid>
        <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.82rem' }}>
          <input type="checkbox" name="veterana" defaultChecked={!!(e.veterana || c.marcado_veterana)} /> Escola veterana (já era parceira antes de 2027)
        </label>
      </Sec>

      <Sec titulo="Modelo de contrato">
        <input type="hidden" name="modalidade" value={modalidade} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '.8rem', marginBottom: '.8rem' }}>
          {(Object.keys(MODALIDADES) as Modalidade[]).map(m => (
            <button type="button" key={m} onClick={() => setModalidade(m)}
              style={{ textAlign: 'left', padding: '.8rem', borderRadius: 12, cursor: 'pointer', border: `2px solid ${modalidade === m ? MODALIDADES[m].cor : '#e2e8f0'}`, background: modalidade === m ? MODALIDADES[m].bg : '#fff' }}>
              <div style={{ fontWeight: 800, color: MODALIDADES[m].cor }}>{MODALIDADES[m].label}</div>
              <div style={{ fontSize: '.75rem', color: '#475569', marginTop: '.2rem' }}>{MODALIDADES[m].desc}</div>
            </button>
          ))}
        </div>
        <Grid>
          <div>
            <label style={lab} htmlFor="status">Situação</label>
            <select id="status" name="status" defaultValue={c.status ?? 'rascunho'} style={inp}>
              {Object.entries(STATUS_CONTRATO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <F l="Início da vigência (assinatura)" n="vigencia_inicio" t="date" v={c.vigencia_inicio} />
          <F l="Fim da vigência" n="vigencia_fim" t="date" v={c.vigencia_fim} />
          <F l="Data de assinatura" n="data_assinatura" t="date" v={c.data_assinatura} />
          <F l="1º ano letivo" n="ano_letivo_inicial" t="number" v={c.ano_letivo_inicial ?? 2027} />
          <F l="Último ano letivo" n="ano_letivo_final" t="number" v={c.ano_letivo_final ?? 2030} />
        </Grid>
      </Sec>

      <Sec titulo="Representante legal">
        <Grid>
          <F l="Nome completo" n="legal_nome" v={c.legal_nome} /><F l="CPF" n="legal_cpf" v={c.legal_cpf} /><F l="RG" n="legal_rg" v={c.legal_rg} />
          <F l="Cargo / função" n="legal_cargo" v={c.legal_cargo} /><F l="E-mail" n="legal_email" t="email" v={c.legal_email} /><F l="Telefone / WhatsApp" n="legal_telefone" v={c.legal_telefone} />
          <F l="CEP" n="legal_cep" v={c.legal_cep} />
        </Grid>
        <F l="Endereço do representante" n="legal_endereco_texto" v={c.legal_endereco_texto} />
        <div style={{ height: '.8rem' }} />
        <F l="Documento que comprova poderes para assinatura" n="poderes_documento" v={c.poderes_documento} />
      </Sec>

      <Sec titulo="Contatos operacionais">
        <Grid>
          <F l="Responsável pedagógico" n="pedagogico_nome" v={c.pedagogico_nome} /><F l="Cargo" n="pedagogico_cargo" v={c.pedagogico_cargo} />
          <F l="E-mail pedagógico" n="pedagogico_email" t="email" v={c.pedagogico_email} /><F l="Telefone" n="pedagogico_telefone" v={c.pedagogico_telefone} />
          <F l="Responsável financeiro" n="financeiro_nome" v={c.financeiro_nome} /><F l="Cargo" n="financeiro_cargo" v={c.financeiro_cargo} />
          <F l="E-mail financeiro" n="financeiro_email" t="email" v={c.financeiro_email} /><F l="Telefone" n="financeiro_telefone" v={c.financeiro_telefone} />
        </Grid>
      </Sec>

      <Sec titulo="Ano letivo">
        <Grid>
          <F l="Início do ano letivo" n="letivo_inicio" t="date" v={c.letivo_inicio} /><F l="Fim do ano letivo" n="letivo_fim" t="date" v={c.letivo_fim} />
          <div>
            <label style={lab} htmlFor="formato_calendario">Formato do calendário</label>
            <select id="formato_calendario" name="formato_calendario" defaultValue={c.formato_calendario ?? ''} style={inp}>
              <option value="">—</option><option value="bimestral">Bimestral</option><option value="trimestral">Trimestral</option><option value="semestral">Semestral</option>
            </select>
          </div>
          <F l="Alunos (efetivo/estimativa)" n="qtd_alunos_estimado" t="number" v={c.qtd_alunos_estimado} />
          <F l="Pais / responsáveis" n="qtd_responsaveis" t="number" v={c.qtd_responsaveis} />
          <F l="Professores" n="qtd_professores" t="number" v={c.qtd_professores} />
          <F l="Coordenadores" n="qtd_coordenadores" t="number" v={c.qtd_coordenadores} />
        </Grid>
      </Sec>

      <Sec titulo="Kits e valores por série (Anexo I e IV — 1º ano letivo)">
        <div style={{ display: 'grid', gap: '.5rem' }}>
          {linhas.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px,1.3fr) minmax(110px,1fr) 90px 120px 34px', gap: '.5rem', alignItems: 'center' }}>
              <select value={l.serie} onChange={ev => setLinha(i, { serie: ev.target.value })} style={inp}>
                {SERIES_CONTRATO.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select value={l.tipo_kit} onChange={ev => setLinha(i, { tipo_kit: ev.target.value })} style={inp}>
                <option value="completo">Kit completo</option><option value="sem_ingles">Sem Inglês</option><option value="so_ingles">Só Inglês</option>
              </select>
              <input type="number" min={0} value={l.quantidade} onChange={ev => setLinha(i, { quantidade: Number(ev.target.value) })} style={inp} aria-label="Quantidade" />
              <input type="number" min={0} step="0.01" value={l.valor_unitario ?? ''} placeholder="R$ unit." onChange={ev => setLinha(i, { valor_unitario: ev.target.value === '' ? null : Number(ev.target.value) })} style={inp} aria-label="Valor unitário" />
              <button type="button" onClick={() => setLinhas(ls => ls.filter((_, k) => k !== i))} aria-label="Remover linha" style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, height: 34, cursor: 'pointer' }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.5rem', margin: '.7rem 0', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setLinhas(ls => [...ls, { serie: 'infantil2', tipo_kit: 'completo', quantidade: 0, valor_unitario: null, curriculo: '' }])}
            style={{ padding: '.4rem .8rem', borderRadius: 9999, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>+ Adicionar linha</button>
          <button type="button" onClick={todasSeries}
            style={{ padding: '.4rem .8rem', borderRadius: 9999, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>Incluir as 9 séries</button>
        </div>
        <div style={{ fontSize: '.85rem', background: '#f8fafc', borderRadius: 10, padding: '.6rem .8rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span><strong>{kits}</strong> kits</span><span>Total calculado: <strong>{brl(calc)}</strong></span>
        </div>
        <div style={{ height: '.8rem' }} />
        <Grid>
          <div>
            <label style={lab} htmlFor="valor_total">Valor total do contrato (1º ano) — como consta no documento</label>
            <input id="valor_total" name="valor_total" value={valorTotal} onChange={ev => setValorTotal(ev.target.value)} style={inp} placeholder="Ex.: 55200" inputMode="decimal" />
          </div>
          <F l="Anos seguintes" n="valor_anos_seguintes_texto" v={c.valor_anos_seguintes_texto ?? 'a negociar (de acordo com a tabela vigente de cada ano)'} />
          <F l="Descontos / bonificações" n="desconto_bonificacao" v={c.desconto_bonificacao} />
        </Grid>
        {diverge && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '.5rem .7rem', fontSize: '.8rem', color: '#92400e' }}>
            O valor informado ({brl(informado)}) é diferente do cálculo das séries ({brl(calc)}). Confira antes de gerar o contrato.
          </div>
        )}
      </Sec>

      {modalidade === 'boleto' && (
        <Sec titulo="Pagamento — Boleto">
          <input type="hidden" name="forma_pagamento" value="boleto" />
          <Grid>
            <F l="Número de parcelas" n="num_parcelas" t="number" v={c.num_parcelas} /><F l="Valor da parcela" n="valor_parcela" t="number" v={c.valor_parcela} />
            <F l="Primeiro vencimento" n="primeiro_vencimento" t="date" v={c.primeiro_vencimento} />
            <F l="Primeiro vencimento (texto, se só o mês)" n="primeiro_vencimento_texto" v={c.primeiro_vencimento_texto} ph="dezembro" />
            <F l="Dia de vencimento das demais" n="dia_vencimento" t="number" v={c.dia_vencimento ?? 10} />
          </Grid>
        </Sec>
      )}
      {modalidade === 'eskolare' && (
        <Sec titulo="Pagamento — Eskolare (loja virtual)">
          <input type="hidden" name="forma_pagamento" value="pix_cartao_loja_virtual" />
          <Grid>
            <F l="Parcelas máximas no cartão" n="parcelas_max_cartao" t="number" v={c.parcelas_max_cartao ?? 10} />
            <div>
              <label style={lab} htmlFor="repasse_tipo">Valor líquido pago à escola</label>
              <select id="repasse_tipo" name="repasse_tipo" defaultValue={c.repasse_tipo ?? ''} style={inp}>
                <option value="">— definir —</option><option value="fixo">Fixo por kit</option><option value="variavel">Variável (% da venda)</option>
              </select>
            </div>
            <F l="Valor por kit (R$) — se fixo" n="repasse_valor" t="number" v={c.repasse_valor} />
            <F l="Percentual (%) — se variável" n="repasse_pct" t="number" v={c.repasse_pct} />
            <F l="Primeiro vencimento (texto)" n="primeiro_vencimento_texto" v={c.primeiro_vencimento_texto} />
          </Grid>
          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.82rem' }}>
            <input type="checkbox" name="nota_fiscal_repasse" defaultChecked={!!c.nota_fiscal_repasse} /> A escola emitirá nota fiscal do repasse (facultativo)
          </label>
        </Sec>
      )}

      <Sec titulo="Dados bancários (Anexo III) e assinatura">
        <Grid>
          <F l="Banco" n="banco" v={c.banco} /><F l="Agência" n="agencia" v={c.agencia} /><F l="Conta" n="conta" v={c.conta} />
          <F l="Tipo de conta" n="tipo_conta" v={c.tipo_conta} /><F l="Titular" n="titular" v={c.titular} /><F l="CPF/CNPJ do titular" n="titular_documento" v={c.titular_documento} />
          <F l="Chave Pix" n="chave_pix" v={c.chave_pix} />
        </Grid>
        <Grid>
          <F l="E-mail para assinatura" n="assinatura_email" t="email" v={c.assinatura_email} />
          <F l="Testemunha 1 — nome" n="testemunha1_nome" v={c.testemunha1_nome} /><F l="Testemunha 1 — CPF" n="testemunha1_cpf" v={c.testemunha1_cpf} />
          <F l="Testemunha 2 — nome" n="testemunha2_nome" v={c.testemunha2_nome} /><F l="Testemunha 2 — CPF" n="testemunha2_cpf" v={c.testemunha2_cpf} />
        </Grid>
      </Sec>

      <Sec titulo="Documento e observações">
        <F l="Link do contrato (Drive), se houver" n="drive_contrato_url" v={c.drive_contrato_url} ph="https://" />
        <div style={{ height: '.8rem' }} />
        <label style={lab} htmlFor="clausulas_especiais">Cláusulas especiais (diferentes do modelo padrão)</label>
        <textarea id="clausulas_especiais" name="clausulas_especiais" rows={3} defaultValue={c.clausulas_especiais ?? ''} style={inp} />
        <div style={{ height: '.8rem' }} />
        <label style={lab} htmlFor="observacoes">Observações internas</label>
        <textarea id="observacoes" name="observacoes" rows={3} defaultValue={c.observacoes ?? ''} style={inp} />
      </Sec>

      <button type="submit" disabled={pendente || !modalidade}
        style={{ padding: '.8rem 2rem', borderRadius: 9999, border: 'none', background: !modalidade ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 800, fontSize: '.95rem', cursor: pendente || !modalidade ? 'not-allowed' : 'pointer' }}>
        {pendente ? 'Salvando…' : modo === 'novo' ? 'Cadastrar contrato' : 'Salvar alterações'}
      </button>
      {!modalidade && <span style={{ marginLeft: '.8rem', fontSize: '.8rem', color: '#64748b' }}>Escolha o modelo (Boleto ou Eskolare) para salvar.</span>}
    </form>
  )
}
