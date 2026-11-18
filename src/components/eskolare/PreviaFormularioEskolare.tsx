'use client'

import { useEffect, useMemo, useState } from 'react'
import { blocosPublicos, camposDoBloco, MAX_PARTICIPANTES, type Campo } from '@/lib/eskolare-campos'
import { formatarCnpj, formatarCep, formatarCpf, formatarWhatsapp } from '@/lib/eskolare-validacao'

// Modelo do formulário que a escola recebe, para a equipe ver o layout e as perguntas. Nada é salvo nem enviado.
const BLOCOS = blocosPublicos()
const EXEMPLO_PRE: Record<string, string> = {
  razao_social: 'Colégio Exemplo Ltda', nome_loja: 'Colégio Exemplo', cidade_uf: 'João Pessoa / PB', parc_nome: 'Maria da Silva', parc_cargo: 'Diretora',
  parc_email: 'maria@colegioexemplo.com.br', parc_whatsapp: '(83) 99999-0000', al_inf2: '12', al_inf3: '15',
}
const inputStyle: React.CSSProperties = { width: '100%', padding: '.7rem .85rem', fontSize: '1rem', border: '1px solid #cbd5e1', borderRadius: 10, background: '#fff', boxSizing: 'border-box' }

function mascara(c: Campo, v: string) {
  if (c.tipo === 'cnpj') return formatarCnpj(v)
  if (c.tipo === 'cpf') return formatarCpf(v)
  if (c.tipo === 'cep') return formatarCep(v)
  if (c.tipo === 'whatsapp') return formatarWhatsapp(v)
  return v
}

export function PreviaFormularioEskolare() {
  const [modo, setModo] = useState<'passos' | 'lista'>('passos')
  const [etapa, setEtapa] = useState(0)
  const [v, setV] = useState<Record<string, string>>({ ...EXEMPLO_PRE })
  const [pre, setPre] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.keys(EXEMPLO_PRE).map(k => [k, true])))
  const [partsMostrados, setPartsMostrados] = useState(1)
  const ultima = BLOCOS.length
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [etapa])   // Continuar/Voltar abre a etapa pelo topo
  const totalPerg = useMemo(() => BLOCOS.reduce((a, b) => a + camposDoBloco(b.id).filter(c => c.tipo !== 'calculado' && (!c.participante || c.participante === 1)).length, 0), [])
  const respondidas = Object.entries(v).filter(([k, x]) => x.trim() && !pre[k]).length
  const pct = Math.round((respondidas / totalPerg) * 100)

  function alterar(c: Campo, valor: string) { setV(s => ({ ...s, [c.chave]: mascara(c, valor) })); setPre(p => ({ ...p, [c.chave]: false })) }

  function campo(c: Campo) {
    const valor = v[c.chave] ?? ''
    const ePre = pre[c.chave] && !!valor
    if (c.tipo === 'calculado') {
      const soma = ['al_inf2', 'al_inf3', 'al_inf4', 'al_inf5', 'al_ano1', 'al_ano2', 'al_ano3', 'al_ano4', 'al_ano5'].reduce((a, k) => a + (parseInt(v[k] ?? '', 10) || 0), 0)
      return (
        <div key={c.chave} style={{ marginBottom: '1.1rem' }}>
          <div style={{ fontSize: '.88rem', fontWeight: 700, color: '#1e293b' }}>{c.rotulo}: <span style={{ color: '#0369a1' }}>{soma}</span></div>
          {c.ajuda && <p style={{ fontSize: '.76rem', color: '#64748b', margin: '.2rem 0 0' }}>{c.ajuda}</p>}
        </div>
      )
    }
    return (
      <div key={c.chave} style={{ marginBottom: '1.1rem' }}>
        <label style={{ display: 'block', fontSize: '.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '.3rem' }}>
          {c.rotulo}{ePre && <span style={{ marginLeft: '.5rem', fontSize: '.68rem', color: '#0369a1', fontWeight: 800 }}>PRÉ-PREENCHIDO</span>}
        </label>
        {c.ajuda && <p style={{ fontSize: '.76rem', color: '#64748b', margin: '0 0 .35rem' }}>{c.ajuda}</p>}
        {c.tipo === 'logo' ? (
          <span style={{ display: 'inline-block', padding: '.65rem 1.1rem', borderRadius: 9999, background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.9rem' }}>⬆ Enviar logo</span>
        ) : c.tipo === 'opcoes' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {c.opcoes!.map(o => (
              <button type="button" key={o} onClick={() => alterar(c, valor === o ? '' : o)} aria-pressed={valor === o}
                style={{ padding: '.6rem 1rem', borderRadius: 9999, fontSize: '.92rem', fontWeight: 700, cursor: 'pointer', border: `2px solid ${valor === o ? '#0ea5e9' : '#cbd5e1'}`, background: valor === o ? '#e0f2fe' : '#fff', color: valor === o ? '#0369a1' : '#475569' }}>{o}</button>
            ))}
          </div>
        ) : (
          <div>
            <input value={valor} onChange={e => alterar(c, e.target.value)} autoComplete="off"
              placeholder={c.tipo === 'whatsapp' ? '(DD) 9XXXX-XXXX' : c.tipo === 'cnpj' ? '00.000.000/0000-00' : c.tipo === 'cpf' ? '000.000.000-00' : c.tipo === 'cep' ? '00000-000' : c.tipo === 'dinheiro' ? '0,00' : ''}
              style={{ ...inputStyle, borderColor: ePre ? '#7dd3fc' : '#cbd5e1', background: ePre ? '#f0f9ff' : '#fff' }} />
            {ePre && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.45rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setPre(p => ({ ...p, [c.chave]: false }))} style={{ padding: '.45rem .9rem', borderRadius: 9999, border: 'none', background: '#059669', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}>✓ Está correto</button>
                <span style={{ fontSize: '.74rem', color: '#64748b' }}>Já preenchemos para você ganhar tempo. Se algo estiver diferente, é só editar acima.</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const bloco = (idx: number) => {
    const b = BLOCOS[idx]
    return (
      <div key={b.id}>
        <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.55rem', margin: '0 0 .3rem', color: '#0f172a' }}>{idx + 1}. {b.titulo}</h2>
        {b.descricao && <p style={{ fontSize: '.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>{b.descricao}</p>}
        {camposDoBloco(b.id).filter(c => !c.participante || c.participante <= partsMostrados).map((c, i, arr) => {
          const ant = arr[i - 1]; const prox = arr[i + 1]
          const cabecalho = c.participante && c.participante !== ant?.participante && partsMostrados > 1
          const fim = !!c.participante && prox?.participante !== c.participante && !prox?.participante
          return (
            <div key={c.chave}>
              {cabecalho && <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#0369a1', margin: '.4rem 0 .6rem', paddingTop: '.5rem', borderTop: c.participante! > 1 ? '1px dashed #cbd5e1' : 'none' }}>Participante {c.participante}</div>}
              {campo(c)}
              {fim && partsMostrados < MAX_PARTICIPANTES && (
                <button type="button" onClick={() => setPartsMostrados(n => Math.min(MAX_PARTICIPANTES, n + 1))}
                  style={{ padding: '.6rem 1rem', borderRadius: 9999, border: '2px dashed #0ea5e9', background: '#f0f9ff', color: '#0369a1', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', marginBottom: '1.1rem' }}>+ Adicionar participante</button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const tab = (id: 'passos' | 'lista', t: string) => (
    <button type="button" onClick={() => setModo(id)} style={{ padding: '.5rem 1rem', borderRadius: 9999, border: `2px solid ${modo === id ? '#0ea5e9' : '#cbd5e1'}`, background: modo === id ? '#e0f2fe' : '#fff', color: modo === id ? '#0369a1' : '#475569', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}>{t}</button>
  )

  return (
    <div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '.7rem 1rem', fontSize: '.85rem', color: '#92400e', marginBottom: '1rem' }}>
        <strong>Modelo para visualização.</strong> É o formulário que a escola recebe, com as mesmas perguntas, textos de apoio e campos já preenchidos que ela pode editar. Pode digitar à vontade: nada é salvo nem enviado.
      </div>
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>{tab('passos', 'Passo a passo (como a escola vê)')}{tab('lista', `Todas as perguntas numa página (${totalPerg})`)}</div>

      {modo === 'lista' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
          {BLOCOS.map((b, i) => <div key={b.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.1rem 1.25rem' }}>{bloco(i)}</div>)}
        </div>
      ) : (
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem', boxShadow: '0 10px 30px rgba(15,23,42,.08)' }}>
          <div style={{ margin: '-1.25rem -1.25rem 1rem', padding: '.8rem 1.25rem .7rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', fontWeight: 700, color: '#475569' }}><span>Colégio Exemplo</span><span>{pct}% preenchido</span></div>
            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999, margin: '.4rem 0' }}><div style={{ width: `${pct}%`, height: '100%', background: '#0ea5e9', borderRadius: 9999 }} /></div>
            <div style={{ fontSize: '.7rem', color: '#64748b' }}>Etapa {etapa + 1} de {ultima + 1} · {etapa < ultima ? BLOCOS[etapa].titulo : 'Revisão'}</div>
          </div>
          {etapa === 0 && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '.8rem 1rem', margin: '0 0 1rem', fontSize: '.84rem', color: '#0c4a6e', lineHeight: 1.55 }}>
              <strong>Antes de começar</strong>
              <ul style={{ margin: '.35rem 0 .5rem 1.1rem', padding: 0, listStyle: 'disc' }}>
                <li>Esta ficha leva cerca de 10 minutos. Serve para a Cidade Viva criar a loja online da escola, onde as famílias compram os kits.</li>
                <li>Deixe à mão: CNPJ, a logo da escola e os contatos das pessoas responsáveis.</li>
                <li>O que você preencher fica salvo sozinho. Pode fechar a página e voltar depois. No final, clique em Enviar respostas.</li>
              </ul>
              <span style={{ fontSize: '.76rem', color: '#475569' }}>🔒 Seus dados são usados apenas para criar a loja da escola na Eskolare e para o treinamento (LGPD).</span>
            </div>
          )}
          {etapa < ultima ? bloco(etapa) : (
            <div>
              <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.55rem', margin: '0 0 .3rem' }}>Revisão</h2>
              <p style={{ fontSize: '.88rem', color: '#475569', margin: '0 0 1rem' }}>Confira os dados antes de enviar. Depois do envio, a ficha fica somente para leitura.</p>
              {BLOCOS.map((b, i) => (
                <div key={b.id} style={{ marginBottom: '.9rem', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '.5rem .8rem' }}><strong style={{ fontSize: '.85rem' }}>{i + 1}. {b.titulo}</strong><button type="button" onClick={() => setEtapa(i)} style={{ border: 'none', background: 'none', color: '#0ea5e9', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer' }}>Editar</button></div>
                  <div style={{ padding: '.5rem .8rem' }}>
                    {camposDoBloco(b.id).filter(c => c.tipo !== 'calculado' && c.tipo !== 'logo' && (!c.participante || c.participante <= partsMostrados)).map(c => (
                      <div key={c.chave} style={{ display: 'flex', justifyContent: 'space-between', gap: '.8rem', fontSize: '.82rem', padding: '.2rem 0', borderBottom: '1px dashed #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>{c.rotulo}</span><span style={{ fontWeight: 600, textAlign: 'right', color: v[c.chave] ? '#0f172a' : '#94a3b8' }}>{v[c.chave] || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" disabled style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: 9999, background: '#cbd5e1', color: '#fff', fontWeight: 900, fontSize: '1.05rem' }}>Enviar respostas (desativado no modelo)</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '.6rem', marginTop: '1.4rem' }}>
            {etapa > 0 && <button type="button" onClick={() => setEtapa(e => e - 1)} style={{ flex: 1, padding: '.85rem', borderRadius: 9999, border: '2px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}>← Voltar</button>}
            {etapa < ultima && <button type="button" onClick={() => setEtapa(e => e + 1)} style={{ flex: 2, padding: '.85rem', borderRadius: 9999, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{etapa === ultima - 1 ? 'Revisar →' : 'Continuar →'}</button>}
          </div>
        </div>
      )}
    </div>
  )
}
