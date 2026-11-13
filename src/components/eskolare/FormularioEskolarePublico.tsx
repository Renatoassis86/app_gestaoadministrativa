'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { blocosPublicos, CAMPOS, calcularPreenchimento, campoVisivel, camposDoBloco, totalAlunos, vazio, type Campo } from '@/lib/eskolare-campos'

// O bloco do contrato é interno: a escola não o vê.
const BLOCOS = blocosPublicos()
import { formatarCep, formatarCnpj, formatarCpf, formatarWhatsapp, validarValor } from '@/lib/eskolare-validacao'
import { enviarLogo, enviarRespostas, salvarCampoPublico } from '@/lib/eskolare-publico'
import type { FichaPublica } from '@/lib/eskolare-sessao'

const MASCARAS: Record<string, (v: string) => string> = { cnpj: formatarCnpj, cpf: formatarCpf, cep: formatarCep, whatsapp: formatarWhatsapp }
const inputStyle: React.CSSProperties = { width: '100%', padding: '.7rem .8rem', fontSize: '1rem', border: '1.5px solid #cbd5e1', borderRadius: 10, background: '#fff', outline: 'none' }

export function FormularioEskolarePublico({ token, inicial }: { token: string; inicial: FichaPublica }) {
  const router = useRouter()
  const [ficha, setFicha] = useState(inicial)
  const [valores, setValores] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(inicial.campos).map(([k, v]) => [k, v.valor])))
  const [situacoes, setSituacoes] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(inicial.campos).map(([k, v]) => [k, v.situacao])))
  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(0)
  const [salvoEm, setSalvoEm] = useState<Date | null>(null)
  const [etapa, setEtapa] = useState(inicial.somenteLeitura ? BLOCOS.length : 0)                         // 0..BLOCOS.length-1 = blocos; BLOCOS.length = revisão
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [erroLogo, setErroLogo] = useState('')
  const [offline, setOffline] = useState(false)
  const [recuperado, setRecuperado] = useState(false)
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const pendentes = useRef<Set<string>>(new Set())          // campos digitados e ainda não confirmados pelo servidor
  const valoresRef = useRef(valores)
  const retry = useRef<ReturnType<typeof setTimeout> | null>(null)
  const topo = useRef<HTMLDivElement>(null)

  const leitura = ficha.somenteLeitura
  const dadosAtuais = useMemo(() => ({ ...valores, logo: ficha.logoUrl || valores.logo ? 'ok' : '' }), [valores, ficha.logoUrl])
  const calc = useMemo(() => calcularPreenchimento(dadosAtuais, situacoes), [dadosAtuais, situacoes])
  const ultimaEtapa = BLOCOS.length
  const chaveLocal = `esk_rascunho_${token.slice(0, 16)}`
  valoresRef.current = valores

  // Cópia local do rascunho: protege contra aba fechada, queda de conexão e sessão expirada.
  function gravarLocal(extra?: { etapa?: number }) {
    try {
      const antigo = JSON.parse(localStorage.getItem(chaveLocal) || '{}')
      const vals: Record<string, string> = {}
      for (const k of pendentes.current) vals[k] = valoresRef.current[k] ?? ''
      localStorage.setItem(chaveLocal, JSON.stringify({ pendentes: vals, etapa: extra?.etapa ?? antigo.etapa ?? 0, em: Date.now() }))
    } catch { /* navegação privada / sem espaço: o servidor continua sendo o rascunho principal */ }
  }
  function limparLocal() { try { localStorage.removeItem(chaveLocal) } catch { /* ignora */ } }

  useEffect(() => { topo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [etapa])

  // Ao abrir: volta para a etapa em que parou e reenvia o que ficou pendente na última visita.
  useEffect(() => {
    if (leitura) { limparLocal(); return }
    try {
      const salvo = JSON.parse(localStorage.getItem(chaveLocal) || 'null')
      if (!salvo) return
      if (Number.isInteger(salvo.etapa) && salvo.etapa > 0 && salvo.etapa <= BLOCOS.length) setEtapa(salvo.etapa)
      const pend = (salvo.pendentes ?? {}) as Record<string, string>
      const diferentes = Object.entries(pend).filter(([k, v]) => CAMPOS.some(c => c.chave === k && !c.interno && c.tipo !== 'calculado' && c.tipo !== 'logo') && (valoresRef.current[k] ?? '') !== v)
      if (!diferentes.length) return
      setValores(vs => ({ ...vs, ...Object.fromEntries(diferentes) }))
      setRecuperado(true)
      for (const [k, v] of diferentes) {
        const c = CAMPOS.find(x => x.chave === k)!
        const check = validarValor(c.tipo, v, c.opcoes, c.chave)
        pendentes.current.add(k)
        if (check.erro) setErros(e => ({ ...e, [k]: check.erro! }))
        else void persistir(k, v)
      }
    } catch { /* ignora */ }
  }, [])                                                                            // eslint-disable-line react-hooks/exhaustive-deps

  // Declarado DEPOIS da restauração acima: no primeiro render não pode sobrescrever a cópia local antes de ela ser lida.
  useEffect(() => { if (!leitura) gravarLocal({ etapa }) }, [etapa])           // eslint-disable-line react-hooks/exhaustive-deps

  // Grava imediatamente tudo o que estiver aguardando o atraso do salvamento (aba em segundo plano / fechando).
  function descarregar() {
    for (const [k, t] of Object.entries(timers.current)) {
      clearTimeout(t); delete timers.current[k]
      void persistir(k, valoresRef.current[k] ?? '')
    }
  }
  useEffect(() => {
    if (leitura) return
    const aoEsconder = () => { if (document.visibilityState === 'hidden') { gravarLocal(); descarregar() } }
    const aoSair = (ev: BeforeUnloadEvent) => { gravarLocal(); descarregar(); if (pendentes.current.size > 0) { ev.preventDefault(); ev.returnValue = '' } }
    const aoVoltarRede = () => { setOffline(false); for (const k of pendentes.current) void persistir(k, valoresRef.current[k] ?? '') }
    document.addEventListener('visibilitychange', aoEsconder)
    window.addEventListener('beforeunload', aoSair)
    window.addEventListener('pagehide', aoEsconder as EventListener)
    window.addEventListener('online', aoVoltarRede)
    return () => {
      document.removeEventListener('visibilitychange', aoEsconder); window.removeEventListener('beforeunload', aoSair)
      window.removeEventListener('pagehide', aoEsconder as EventListener); window.removeEventListener('online', aoVoltarRede)
    }
  }, [leitura])                                                                     // eslint-disable-line react-hooks/exhaustive-deps

  // Salva um campo por vez, na ordem em que foram digitados (evita disputa entre gravações da mesma ficha).
  const fila = useRef<Promise<unknown>>(Promise.resolve())
  function persistir(chave: string, valor: string, acao: 'salvar' | 'confirmar' = 'salvar') {
    const p = fila.current.then(() => executarPersistencia(chave, valor, acao))
    fila.current = p.catch(() => undefined)
    return p
  }
  async function executarPersistencia(chave: string, valor: string, acao: 'salvar' | 'confirmar' = 'salvar') {
    setSalvando(n => n + 1)
    let r
    try { r = await salvarCampoPublico(token, chave, valor, acao) }
    catch {                                                   // sem conexão: mantém no rascunho local e tenta de novo
      setSalvando(n => n - 1); setOffline(true); pendentes.current.add(chave); gravarLocal()
      if (retry.current) clearTimeout(retry.current)
      retry.current = setTimeout(() => { for (const k of pendentes.current) void persistir(k, valoresRef.current[k] ?? '') }, 5000)
      return
    }
    setSalvando(n => n - 1)
    if (r.sessaoExpirada) { gravarLocal(); router.refresh(); return }     // o rascunho local volta depois do PIN
    if (!r.ok) { setErros(e => ({ ...e, [chave]: r.error ?? 'Erro ao salvar.' })); return }
    setOffline(false)
    if ((valoresRef.current[chave] ?? '') === valor) pendentes.current.delete(chave)   // só quita se não houve nova digitação
    gravarLocal()
    setErros(e => { const { [chave]: _, ...resto } = e; return resto })
    if (r.situacao) setSituacoes(s => ({ ...s, [chave]: r.situacao! }))
    setSalvoEm(new Date())
  }

  function alterar(c: Campo, bruto: string, imediato = false) {
    const v = MASCARAS[c.tipo] ? MASCARAS[c.tipo](bruto) : bruto
    setValores(vs => ({ ...vs, [c.chave]: v }))
    valoresRef.current = { ...valoresRef.current, [c.chave]: v }
    pendentes.current.add(c.chave); gravarLocal()
    clearTimeout(timers.current[c.chave])
    const check = validarValor(c.tipo, v, c.opcoes, c.chave)
    if (check.erro) { setErros(e => ({ ...e, [c.chave]: check.erro! })); return }      // não salva valor inválido
    setErros(e => { const { [c.chave]: _, ...resto } = e; return resto })
    if (imediato) void persistir(c.chave, v)
    else timers.current[c.chave] = setTimeout(() => { delete timers.current[c.chave]; void persistir(c.chave, v) }, 600)
  }

  async function confirmar(c: Campo) {
    setSituacoes(s => ({ ...s, [c.chave]: 'confirmado' }))
    await persistir(c.chave, valores[c.chave], 'confirmar')
  }

  async function subirLogo(ev: React.ChangeEvent<HTMLInputElement>) {
    const arq = ev.target.files?.[0]; if (!arq) return
    setErroLogo('')
    if (arq.size > 5 * 1024 * 1024) { setErroLogo('A logo deve ter até 5 MB.'); return }
    if (arq.type !== 'image/png') { setErroLogo('Envie um arquivo PNG.'); return }
    setSalvando(n => n + 1)
    const fd = new FormData(); fd.set('token', token); fd.set('arquivo', arq)
    const r = await enviarLogo(fd)
    setSalvando(n => n - 1)
    if (r.sessaoExpirada) { router.refresh(); return }
    if (!r.ok || !r.ficha) { setErroLogo(r.error ?? 'Não foi possível enviar.'); return }
    setFicha(r.ficha); setSalvoEm(new Date())
    setValores(vs => ({ ...vs, logo: 'ok' })); setSituacoes(s => ({ ...s, logo: 'preenchido_escola' }))
  }

  async function enviar() {
    setEnviando(true); setErroEnvio('')
    // garante que qualquer digitação pendente foi gravada antes de enviar
    for (const [k, t] of Object.entries(timers.current)) { clearTimeout(t); if (!erros[k]) await persistir(k, valores[k]) }
    const r = await enviarRespostas(token)
    setEnviando(false)
    if (r.sessaoExpirada) { router.refresh(); return }
    if (!r.ok) { setErroEnvio(r.error ?? 'Não foi possível enviar.'); return }
    pendentes.current.clear(); limparLocal()
    setFicha(f => ({ ...f, somenteLeitura: true, status: 'respondida' })); setEtapa(ultimaEtapa)
  }

  // ── campo ──────────────────────────────────────────────────────────────────
  function renderCampo(c: Campo) {
    const valor = valores[c.chave] ?? ''
    const sit = situacoes[c.chave] ?? 'branco'
    const erro = erros[c.chave]
    const preMode = sit === 'pre' && !leitura && c.tipo !== 'logo' && c.tipo !== 'opcoes' && !vazio(valor)

    return (
      <div key={c.chave} style={{ marginBottom: '1.1rem' }}>
        <label htmlFor={c.chave} style={{ display: 'block', fontSize: '.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '.3rem' }}>
          {c.rotulo}{c.obrigatorio && <span style={{ color: '#dc2626' }}> *</span>}
          {preMode && <span style={{ marginLeft: '.5rem', fontSize: '.68rem', color: '#0369a1', fontWeight: 800 }}>PRÉ-PREENCHIDO</span>}
          {sit === 'confirmado' && <span style={{ marginLeft: '.5rem', fontSize: '.68rem', color: '#047857', fontWeight: 800 }}>✓ CONFIRMADO</span>}
          {sit === 'corrigido' && <span style={{ marginLeft: '.5rem', fontSize: '.68rem', color: '#b45309', fontWeight: 800 }}>✎ CORRIGIDO</span>}
        </label>
        {c.ajuda && <p style={{ fontSize: '.76rem', color: '#64748b', margin: '0 0 .35rem' }}>{c.ajuda}</p>}

        {c.tipo === 'logo' ? (
          <div>
            {ficha.logoUrl && <img src={ficha.logoUrl} alt="Logo enviada" style={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 10, padding: 6, background: '#fff', marginBottom: '.5rem', display: 'block' }} />}
            {!leitura && (
              <label style={{ display: 'inline-block', padding: '.65rem 1.1rem', borderRadius: 9999, background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer' }}>
                {ficha.logoUrl ? 'Trocar logo' : '⬆ Enviar logo (PNG)'}
                <input type="file" accept="image/png" hidden onChange={subirLogo} />
              </label>
            )}
            {erroLogo && <p role="alert" style={{ color: '#b91c1c', fontSize: '.8rem', margin: '.4rem 0 0' }}>{erroLogo}</p>}
          </div>
        ) : c.tipo === 'opcoes' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {c.opcoes!.map(o => (
              <button type="button" key={o} disabled={leitura} onClick={() => alterar(c, valor === o ? '' : o, true)}
                aria-pressed={valor === o}
                style={{ padding: '.6rem 1rem', borderRadius: 9999, fontSize: '.92rem', fontWeight: 700, cursor: leitura ? 'default' : 'pointer',
                         border: `2px solid ${valor === o ? '#0ea5e9' : '#cbd5e1'}`, background: valor === o ? '#e0f2fe' : '#fff', color: valor === o ? '#0369a1' : '#475569' }}>
                {o}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <input id={c.chave} value={valor} disabled={leitura}
              onChange={ev => alterar(c, ev.target.value)}
              onBlur={() => { if (!erros[c.chave] && pendentes.current.has(c.chave)) { clearTimeout(timers.current[c.chave]); void persistir(c.chave, valores[c.chave] ?? '') } }}
              inputMode={c.tipo === 'inteiro' ? 'numeric' : c.tipo === 'dinheiro' ? 'decimal' : c.tipo === 'whatsapp' || c.tipo === 'cep' || c.tipo === 'cnpj' || c.tipo === 'cpf' ? 'numeric' : c.tipo === 'email' ? 'email' : 'text'}
              type={c.tipo === 'email' ? 'email' : 'text'} autoComplete="off"
              placeholder={c.tipo === 'whatsapp' ? '(DD) 9XXXX-XXXX' : c.tipo === 'cnpj' ? '00.000.000/0000-00' : c.tipo === 'cpf' ? '000.000.000-00' : c.tipo === 'cep' ? '00000-000' : c.tipo === 'dinheiro' ? '0,00' : ''}
              style={{ ...inputStyle, borderColor: erro ? '#dc2626' : preMode ? '#7dd3fc' : '#cbd5e1', background: leitura ? '#f1f5f9' : preMode ? '#f0f9ff' : '#fff' }} />
            {preMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.45rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => confirmar(c)} style={{ padding: '.45rem .9rem', borderRadius: 9999, border: 'none', background: '#059669', color: '#fff', fontWeight: 800, fontSize: '.85rem', cursor: 'pointer' }}>✓ Está correto</button>
                <span style={{ fontSize: '.74rem', color: '#64748b' }}>Já preenchemos para você ganhar tempo. Se algo estiver diferente, é só editar acima.</span>
              </div>
            )}
          </div>
        )}
        {erro && <p role="alert" style={{ color: '#b91c1c', fontSize: '.8rem', margin: '.3rem 0 0' }}>{erro}</p>}
      </div>
    )
  }

  function renderBloco(blocoId: number) {
    const campos = camposDoBloco(blocoId).filter(c => campoVisivel(c, valores) && c.tipo !== 'calculado')
    const bloco = BLOCOS.find(b => b.id === blocoId)!
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.55rem', margin: '0 0 .3rem', color: '#0f172a' }}>{bloco.id}. {bloco.titulo}</h2>
        {bloco.descricao && <p style={{ fontSize: '.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>{bloco.descricao}</p>}
        {campos.map(renderCampo)}
        {blocoId === 7 && (
          <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '.7rem .9rem', fontWeight: 800, color: '#0369a1', marginBottom: '1rem' }}>
            Total de alunos: {totalAlunos(valores)}
          </div>
        )}
      </div>
    )
  }

  // ── revisão ────────────────────────────────────────────────────────────────
  function renderRevisao() {
    return (
      <div>
        <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.55rem', margin: '0 0 .3rem' }}>Revisão final</h2>
        {leitura ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 12, padding: '1rem', color: '#065f46', marginBottom: '1rem' }}>
            <strong>Obrigado! Recebemos as respostas da sua escola.</strong><br />
            Nossa equipe vai conferir os dados e montar a loja na Eskolare. Se precisar corrigir algo, fale com o seu contato na Cidade Viva Education.
          </div>
        ) : (
          <p style={{ fontSize: '.88rem', color: '#475569', margin: '0 0 1rem' }}>Confira os dados antes de enviar. Depois do envio, a ficha fica somente para leitura.</p>
        )}
        {calc.faltando.length > 0 && !leitura && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '.7rem .9rem', fontSize: '.84rem', color: '#991b1b', marginBottom: '1rem' }}>
            <strong>Ainda falta:</strong> {calc.faltando.join(' · ')}
          </div>
        )}
        {BLOCOS.map((b, i) => (
          <div key={b.id} style={{ marginBottom: '.9rem', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '.5rem .8rem' }}>
              <strong style={{ fontSize: '.85rem' }}>{b.id}. {b.titulo}</strong>
              {!leitura && <button type="button" onClick={() => setEtapa(i)} style={{ border: 'none', background: 'none', color: '#0ea5e9', fontWeight: 800, fontSize: '.8rem', cursor: 'pointer' }}>Editar</button>}
            </div>
            <div style={{ padding: '.5rem .8rem' }}>
              {camposDoBloco(b.id).filter(c => campoVisivel(c, valores)).map(c => {
                const v = c.tipo === 'calculado' ? String(totalAlunos(valores)) : c.tipo === 'logo' ? (ficha.logoUrl ? 'Logo enviada ✓' : '') : valores[c.chave]
                return (
                  <div key={c.chave} style={{ display: 'flex', justifyContent: 'space-between', gap: '.8rem', fontSize: '.82rem', padding: '.2rem 0', borderBottom: '1px dashed #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>{c.rotulo}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', color: !vazio(v) ? '#0f172a' : c.obrigatorio ? '#dc2626' : '#94a3b8' }}>{!vazio(v) ? v : c.obrigatorio ? 'falta' : '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {!leitura && (
          <>
            {erroEnvio && <p role="alert" style={{ color: '#b91c1c', fontSize: '.85rem' }}>{erroEnvio}</p>}
            <button type="button" onClick={enviar} disabled={calc.pct < 100 || enviando}
              style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: 9999, background: calc.pct < 100 ? '#94a3b8' : '#f59e0b', color: '#fff', fontWeight: 900, fontSize: '1.05rem', cursor: calc.pct < 100 || enviando ? 'not-allowed' : 'pointer', boxShadow: calc.pct === 100 ? '0 6px 18px rgba(245,158,11,.4)' : 'none' }}>
              {enviando ? 'Enviando…' : 'Enviar respostas'}
            </button>
          </>
        )}
      </div>
    )
  }

  const titulos = [...BLOCOS.map(b => b.titulo), 'Revisão']
  return (
    <div>
      <div ref={topo} />
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#fff', margin: '-1.25rem -1.25rem 1rem', padding: '.8rem 1.25rem .7rem', borderBottom: '1px solid #e2e8f0', borderRadius: '16px 16px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', fontWeight: 700, color: '#475569' }}>
          <span>{ficha.escolaNome}</span><span>{calc.pct}% preenchido</span>
        </div>
        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999, margin: '.4rem 0' }}>
          <div style={{ width: `${calc.pct}%`, height: '100%', background: calc.pct === 100 ? '#059669' : '#0ea5e9', borderRadius: 9999, transition: 'width .3s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: '#64748b' }}>
          <span>Etapa {Math.min(etapa + 1, ultimaEtapa + 1)} de {ultimaEtapa + 1} · {titulos[etapa]}</span>
          <span aria-live="polite">{leitura ? 'Somente leitura' : offline ? '⚠ Sem conexão: guardado neste aparelho, será salvo ao reconectar' : salvando > 0 ? 'Salvando…' : salvoEm ? `Rascunho salvo às ${salvoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Rascunho salvo automaticamente'}</span>
        </div>
      </div>

      {leitura && etapa < ultimaEtapa && (
        <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '.6rem .8rem', fontSize: '.82rem', color: '#475569', marginBottom: '1rem' }}>
          As respostas já foram enviadas e esta ficha está somente para leitura.
        </div>
      )}
      {recuperado && !leitura && (
        <p role="status" style={{ fontSize: '.8rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '.6rem .8rem', margin: '0 0 1rem' }}>
          Recuperamos o que você estava digitando quando a página foi fechada.
        </p>
      )}
      {etapa === 0 && !leitura && (
        <p style={{ fontSize: '.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem' }}>
          🔒 Seus dados são usados apenas para criar a loja da escola na Eskolare e para o treinamento (LGPD). Campos com <strong>*</strong> são obrigatórios. Pode fechar a página e voltar depois: o que você preencher fica salvo como rascunho e só é enviado à Cidade Viva quando você clicar em Enviar, no final.
        </p>
      )}

      {etapa < ultimaEtapa ? renderBloco(BLOCOS[etapa].id) : renderRevisao()}

      <div style={{ display: 'flex', gap: '.6rem', marginTop: '1.4rem' }}>
        {etapa > 0 && <button type="button" onClick={() => setEtapa(e => e - 1)} style={{ flex: 1, padding: '.85rem', borderRadius: 9999, border: '2px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}>← Voltar</button>}
        {etapa < ultimaEtapa && <button type="button" onClick={() => setEtapa(e => e + 1)} style={{ flex: 2, padding: '.85rem', borderRadius: 9999, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{etapa === ultimaEtapa - 1 ? 'Revisar →' : 'Continuar →'}</button>}
      </div>
    </div>
  )
}
