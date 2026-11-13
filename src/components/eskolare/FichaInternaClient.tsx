'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BLOCOS, CAMPOS, STATUS_FICHA, etapaEscola, campoVisivel, camposDoBloco, totalAlunos, vazio, type Campo } from '@/lib/eskolare-campos'
import { formatarCep, formatarCnpj, formatarCpf, formatarWhatsapp, mascararCpf } from '@/lib/eskolare-validacao'
import { PainelRespostaEscola } from './PainelRespostaEscola'
import { atualizarDaPlataforma, gerarAcesso, marcarCadastrada, reabrirFicha, revogarAcesso, salvarCamposInternos, validarFicha } from '@/lib/eskolare-actions'

const MASC: Record<string, (v: string) => string> = { cnpj: formatarCnpj, cpf: formatarCpf, cep: formatarCep, whatsapp: formatarWhatsapp }
const inp: React.CSSProperties = { width: '100%', padding: '.5rem .7rem', fontSize: '.88rem', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff' }
const btn = (cor: string, vazado = false): React.CSSProperties => ({ padding: '.5rem 1rem', borderRadius: 9999, fontWeight: 800, fontSize: '.8rem', cursor: 'pointer', border: vazado ? `2px solid ${cor}` : 'none', background: vazado ? '#fff' : cor, color: vazado ? cor : '#fff' })

export interface FichaInterna {
  id: string; escolaNome: string; ciclo: number; status: string; responsavel: string | null; obs: string
  pre: Record<string, string>; dados: Record<string, string>; situacao: Record<string, string>; fontes: Record<string, string>
  pct: number; temAcesso: boolean; revogado: boolean; bloqueadoAte: string | null; ultimoAcesso: string | null
  enviadaEm: string | null; respondidaEm: string | null; validadaEm: string | null; cadastradaEm: string | null
  logoUrl: string | null; ehGerente: boolean; abertaEm: string | null; comecouEm: string | null
  eventos: Array<{ id: string; tipo: string; autor: string; detalhe: any; created_at: string }>
}

const ROTULO_EVENTO: Record<string, string> = {
  criada: 'Ficha criada', enviada: 'Link e PIN gerados', aberta: 'Escola abriu a ficha', pin_errado: 'PIN errado', bloqueada: 'Acesso bloqueado (5 PINs errados)',
  campo: 'Campo alterado', respondida: 'Escola enviou as respostas', validada: 'Validada pelo comercial', cadastrada: 'Cadastrada na Eskolare',
  reaberta: 'Ficha reaberta', revogada: 'Link revogado', importada: 'Importada da planilha', pin_regenerado: 'PIN regenerado',
}
const SIT_ROTULO: Record<string, string> = { branco: 'em branco', pre: 'pré-preenchido', confirmado: 'confirmado pela escola', corrigido: 'corrigido pela escola', preenchido_escola: 'preenchido pela escola' }

export function FichaInternaClient({ f }: { f: FichaInterna }) {
  const router = useRouter()
  const [pendente, start] = useTransition()
  const [valores, setValores] = useState<Record<string, string>>(f.dados)
  const [responsavel, setResponsavel] = useState(f.responsavel ?? 'Raissa')
  const [obs, setObs] = useState(f.obs)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [acesso, setAcesso] = useState<{ link: string; pin: string } | null>(null)
  const [copiado, setCopiado] = useState('')
  const st = { ...(STATUS_FICHA.find(s => s.id === f.status) ?? STATUS_FICHA[0]), ...etapaEscola(f.status, !!f.ultimoAcesso) }
  const nomeEscola = valores.nome_loja || f.escolaNome

  const mensagem = `Olá! Para montar a loja da ${nomeEscola} na Eskolare, precisamos que você confirme alguns dados da escola e preencha o que ainda está em aberto.

Acesse pelo link:
${acesso?.link ?? ''}

Seu PIN de acesso: ${acesso?.pin ?? ''}

Pode preencher aos poucos: tudo fica salvo como rascunho e só é enviado quando você clicar em Enviar. Qualquer dúvida, é só responder esta mensagem.`

  function executar(fn: () => Promise<{ ok: boolean; error?: string; link?: string; pin?: string }>, ok?: string) {
    setMsg('')
    start(async () => {
      const r = await fn()
      if (!r.ok) { setMsg(r.error ?? 'Erro.'); return }
      if (r.link && r.pin) setAcesso({ link: r.link, pin: r.pin })
      if (ok) setMsg(ok)
      router.refresh()
    })
  }
  function salvar() {
    setErros({})
    const patch: Record<string, string> = {}
    for (const c of CAMPOS) if (!c.interno && c.tipo !== 'calculado' && c.tipo !== 'logo' && (valores[c.chave] ?? '') !== (f.dados[c.chave] ?? '')) patch[c.chave] = valores[c.chave] ?? ''
    start(async () => {
      const r = await salvarCamposInternos(f.id, patch, { responsavel, obs })
      if (!r.ok) { setErros(r.erros ?? {}); setMsg(r.error ?? 'Erro ao salvar.'); return }
      setMsg('Alterações salvas.'); router.refresh()
    })
  }
  async function copiar(txt: string, id: string) {
    try { await navigator.clipboard.writeText(txt); setCopiado(id); setTimeout(() => setCopiado(''), 2000) } catch { setMsg('Não foi possível copiar. Selecione o texto manualmente.') }
  }

  const cpfMascarado = (c: Campo) => c.tipo === 'cpf' && !f.ehGerente && !vazio(f.dados[c.chave])
  const exibir = (c: Campo, v: string) => (c.tipo === 'cpf' && !f.ehGerente ? mascararCpf(v) : v)
  const comparacao = CAMPOS.filter(c => !c.interno && c.tipo !== 'calculado' && c.tipo !== 'logo' && (!vazio(f.pre[c.chave]) || !vazio(f.dados[c.chave])))
  const finalizada = ['validada', 'cadastrada'].includes(f.status)

  return (
    <div style={{ display: 'grid', gap: '1.1rem', maxWidth: 1000 }}>
      {/* Cabeçalho e ações de status */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `4px solid ${st.cor}`, borderRadius: 14, padding: '1rem 1.2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.6rem', margin: 0 }}>{f.escolaNome}</h2>
            <span style={{ background: st.bg, color: st.cor, borderRadius: 9999, padding: '.15rem .65rem', fontWeight: 800, fontSize: '.74rem' }}>{st.label}</span>
            <span style={{ marginLeft: '.6rem', fontSize: '.8rem', color: '#64748b' }}>{f.pct}% preenchido · ciclo {f.ciclo}</span>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {f.status === 'respondida' && <button style={btn('#059669')} disabled={pendente} onClick={() => executar(() => validarFicha(f.id), 'Ficha validada.')}>✓ Validar ficha</button>}
            {f.status === 'validada' && <button style={btn('#065f46')} disabled={pendente} onClick={() => executar(() => marcarCadastrada(f.id), 'Marcada como cadastrada na Eskolare.')}>Marcar como cadastrada na Eskolare</button>}
            {['respondida', 'validada', 'cadastrada'].includes(f.status) && <button style={btn('#b45309', true)} disabled={pendente} onClick={() => { if (confirm('Reabrir a ficha para a escola corrigir?')) executar(() => reabrirFicha(f.id), 'Ficha reaberta.') }}>Reabrir ficha</button>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', fontSize: '.74rem', color: '#64748b', marginTop: '.6rem' }}>
          {f.enviadaEm && <span>Enviada: {new Date(f.enviadaEm).toLocaleDateString('pt-BR')}</span>}
          {f.ultimoAcesso && <span>Último acesso da escola: {new Date(f.ultimoAcesso).toLocaleString('pt-BR')}</span>}
          {f.respondidaEm && <span>Respondida: {new Date(f.respondidaEm).toLocaleDateString('pt-BR')}</span>}
          {f.validadaEm && <span>Validada: {new Date(f.validadaEm).toLocaleDateString('pt-BR')}</span>}
          {f.cadastradaEm && <span>Cadastrada: {new Date(f.cadastradaEm).toLocaleDateString('pt-BR')}</span>}
        </div>
        {msg && <p role="status" style={{ fontSize: '.82rem', color: msg.includes('Erro') || msg.includes('Não') ? '#b91c1c' : '#047857', margin: '.6rem 0 0' }}>{msg}</p>}
      </section>

      <PainelRespostaEscola d={{ status: f.status, pct: f.pct, dados: f.dados, pre: f.pre, situacao: f.situacao, enviadaEm: f.enviadaEm, abertaEm: f.abertaEm, comecouEm: f.comecouEm, respondidaEm: f.respondidaEm, validadaEm: f.validadaEm, cadastradaEm: f.cadastradaEm, ultimoAcesso: f.ultimoAcesso, logoUrl: f.logoUrl, ehGerente: f.ehGerente }} />

      {/* Acesso da escola */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.2rem' }}>
        <h3 style={{ margin: '0 0 .6rem', fontSize: '.95rem' }}>Acesso da escola (link + PIN)</h3>
        <p style={{ fontSize: '.8rem', color: '#64748b', margin: '0 0 .7rem' }}>
          {!f.temAcesso ? 'Ainda não há link. Gere o link e o PIN e envie à escola por WhatsApp, em uma única mensagem.'
            : f.revogado ? 'O link foi revogado. Gere um novo acesso para reativar.'
            : 'Link ativo. O PIN só aparece no momento em que é gerado; se for perdido, gere outro.'}
          {f.bloqueadoAte && new Date(f.bloqueadoAte) > new Date() && <strong style={{ color: '#b91c1c' }}> Acesso bloqueado até {new Date(f.bloqueadoAte).toLocaleTimeString('pt-BR')} (PIN errado 5 vezes).</strong>}
        </p>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {!f.temAcesso || f.revogado
            ? <button style={btn('#f59e0b')} disabled={pendente || finalizada} onClick={() => executar(() => gerarAcesso(f.id, true))}>Gerar link e PIN</button>
            : <>
                <button style={btn('#0ea5e9')} disabled={pendente || finalizada} onClick={() => executar(() => gerarAcesso(f.id, false))}>Regenerar PIN</button>
                <button style={btn('#0ea5e9', true)} disabled={pendente || finalizada} onClick={() => { if (confirm('Gerar um NOVO link? O link atual deixa de funcionar.')) executar(() => gerarAcesso(f.id, true)) }}>Novo link + PIN</button>
                <button style={btn('#b91c1c', true)} disabled={pendente} onClick={() => { if (confirm('Revogar o link? A escola perde o acesso.')) executar(() => revogarAcesso(f.id), 'Link revogado.') }}>Revogar link</button>
              </>}
        </div>
        {acesso && (
          <div style={{ marginTop: '.9rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '.8rem 1rem' }}>
            <strong style={{ fontSize: '.82rem', color: '#92400e' }}>Copie agora: o PIN não será mostrado de novo.</strong>
            <div style={{ fontSize: '.82rem', margin: '.5rem 0', wordBreak: 'break-all' }}>Link: <code>{acesso.link}</code></div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '.3em', margin: '.3rem 0' }}>{acesso.pin}</div>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <button style={btn('#059669')} onClick={() => copiar(mensagem, 'm')}>{copiado === 'm' ? '✓ Mensagem copiada' : 'Copiar mensagem (link + PIN)'}</button>
            </div>
          </div>
        )}
      </section>

      {/* Pré-preenchimento / edição interna */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.2rem' }}>
        <h3 style={{ margin: '0 0 .3rem', fontSize: '.95rem' }}>Dados da ficha</h3>
        <p style={{ fontSize: '.78rem', color: '#64748b', margin: '0 0 .8rem' }}>
          O que você preencher aqui aparece para a escola já preenchido, editável, com o botão "Está correto". Campos em branco ficam para a escola preencher.
        </p>
        <button style={{ ...btn('#0ea5e9', true), marginBottom: '.8rem' }} disabled={pendente || finalizada}
          onClick={() => start(async () => { const r = await atualizarDaPlataforma(f.id); setMsg(r.ok ? (r.preenchidos ? `${r.preenchidos} campo(s) preenchido(s) com dados da plataforma.` : 'Nada novo na plataforma: todos os campos disponíveis já estão preenchidos.') : (r.error ?? 'Erro.')); router.refresh() })}>
          ↻ Buscar dados na plataforma (só preenche o que está em branco)
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.7rem', marginBottom: '.8rem' }}>
          <label style={{ fontSize: '.76rem', fontWeight: 700 }}>Responsável comercial
            <select value={responsavel} onChange={e => setResponsavel(e.target.value)} style={{ ...inp, marginTop: '.2rem' }}><option>Raissa</option><option>Jesse</option></select>
          </label>
          <label style={{ fontSize: '.76rem', fontWeight: 700, gridColumn: 'span 2' }}>Observações do comercial (a escola não vê)
            <input value={obs} onChange={e => setObs(e.target.value)} style={{ ...inp, marginTop: '.2rem' }} />
          </label>
        </div>

        {BLOCOS.map(b => (
          <details key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: '.5rem' }} open={b.id === 1}>
            <summary style={{ padding: '.6rem .8rem', cursor: 'pointer', fontWeight: 800, fontSize: '.85rem', background: '#f8fafc', borderRadius: 10 }}>{b.id}. {b.titulo}</summary>
            <div style={{ padding: '.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.7rem' }}>
              {camposDoBloco(b.id).filter(c => campoVisivel(c, valores) || c.bloco === 8).map(c => (
                <div key={c.chave}>
                  <label style={{ display: 'block', fontSize: '.74rem', fontWeight: 700, color: '#475569', marginBottom: '.2rem' }}>{c.rotulo}{c.obrigatorio && ' *'}{f.fontes[c.chave] && !f.situacao[c.chave]?.includes('escola') && f.pre[c.chave] ? <span style={{ marginLeft: '.4rem', fontSize: '.62rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', borderRadius: 9999, padding: '.05rem .4rem' }}>{f.fontes[c.chave]}</span> : null}</label>
                  {c.tipo === 'calculado' ? <div style={{ ...inp, background: '#f1f5f9', fontWeight: 800 }}>{totalAlunos(valores)}</div>
                    : c.tipo === 'logo' ? (f.logoUrl ? <img src={f.logoUrl} alt="Logo da escola" style={{ maxHeight: 60, border: '1px solid #e2e8f0', borderRadius: 8, padding: 4, background: '#fff' }} /> : <span style={{ fontSize: '.8rem', color: '#94a3b8' }}>A escola envia pelo link.</span>)
                    : c.tipo === 'opcoes' ? (
                      <select value={valores[c.chave] ?? ''} onChange={e => setValores(v => ({ ...v, [c.chave]: e.target.value }))} style={inp}>
                        <option value="">—</option>{c.opcoes!.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : cpfMascarado(c) ? <div style={{ ...inp, background: '#f1f5f9' }}>{mascararCpf(valores[c.chave])}</div>
                    : <input value={valores[c.chave] ?? ''} onChange={e => setValores(v => ({ ...v, [c.chave]: MASC[c.tipo] ? MASC[c.tipo](e.target.value) : e.target.value }))}
                        style={{ ...inp, borderColor: erros[c.chave] ? '#dc2626' : '#cbd5e1' }} />}
                  {erros[c.chave] && <p style={{ color: '#b91c1c', fontSize: '.72rem', margin: '.2rem 0 0' }}>{erros[c.chave]}</p>}
                </div>
              ))}
            </div>
          </details>
        ))}
        <button style={{ ...btn('#0ea5e9'), marginTop: '.6rem', padding: '.65rem 1.6rem' }} disabled={pendente} onClick={salvar}>{pendente ? 'Salvando…' : 'Salvar alterações'}</button>
      </section>

      {/* Comparação pré-preenchido × escola */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.2rem' }}>
        <h3 style={{ margin: '0 0 .6rem', fontSize: '.95rem' }}>Respostas da escola × pré-preenchido</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem', minWidth: 560 }}>
            <thead><tr style={{ textAlign: 'left', color: '#64748b', fontSize: '.68rem', textTransform: 'uppercase' }}><th style={{ padding: '.4rem' }}>Campo</th><th>Nós pré-preenchemos</th><th>Valor da escola</th><th>Situação</th></tr></thead>
            <tbody>
              {comparacao.map(c => {
                const pre = f.pre[c.chave] ?? '', atual = f.dados[c.chave] ?? ''
                const alterou = pre !== atual || f.situacao[c.chave] === 'corrigido'
                return (
                  <tr key={c.chave} style={{ borderTop: '1px solid #f1f5f9', background: alterou ? '#fffbeb' : undefined }}>
                    <td style={{ padding: '.4rem', fontWeight: 600 }}>{BLOCOS.find(b => b.id === c.bloco)?.id}. {c.rotulo}</td>
                    <td>{exibir(c, pre) || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ fontWeight: alterou ? 800 : 400, color: alterou ? '#b45309' : undefined }}>{exibir(c, atual) || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ color: '#64748b' }}>{SIT_ROTULO[f.situacao[c.chave] ?? 'branco']}{alterou && ' ⚠'}</td>
                  </tr>
                )
              })}
              {comparacao.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', color: '#94a3b8' }}>Nenhum dado ainda.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Histórico */}
      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.2rem' }}>
        <h3 style={{ margin: '0 0 .6rem', fontSize: '.95rem' }}>Histórico</h3>
        <div style={{ display: 'grid', gap: '.35rem', fontSize: '.8rem' }}>
          {f.eventos.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: '.7rem' }}>
              <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(e.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              <span><strong>{ROTULO_EVENTO[e.tipo] ?? e.tipo}</strong>{e.tipo === 'campo' && e.detalhe?.campo ? `: ${CAMPOS.find(c => c.chave === e.detalhe.campo)?.rotulo ?? e.detalhe.campo}` : ''} <span style={{ color: '#94a3b8' }}>({e.autor})</span></span>
            </div>
          ))}
          {f.eventos.length === 0 && <span style={{ color: '#94a3b8' }}>Sem eventos.</span>}
        </div>
      </section>
    </div>
  )
}
