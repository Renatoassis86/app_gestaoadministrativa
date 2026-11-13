import { BLOCOS, CAMPOS, campoVisivel, etapaEscola, totalAlunos, vazio, type Campo } from '@/lib/eskolare-campos'
import { mascararCpf } from '@/lib/eskolare-validacao'

export interface DadosPainel {
  status: string; pct: number; dados: Record<string, string>; pre: Record<string, string>; situacao: Record<string, string>
  enviadaEm: string | null; abertaEm: string | null; comecouEm: string | null; respondidaEm: string | null; validadaEm: string | null; cadastradaEm: string | null
  ultimoAcesso: string | null; logoUrl: string | null; ehGerente: boolean
}

const fd = (iso: string | null) => iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null
const TAG: Record<string, { t: string; cor: string; bg: string }> = {
  preenchido_escola: { t: 'preenchido pela escola', cor: '#047857', bg: '#d1fae5' },
  confirmado: { t: 'confirmado', cor: '#0369a1', bg: '#e0f2fe' },
  corrigido: { t: 'corrigido pela escola', cor: '#b45309', bg: '#fef3c7' },
  pre: { t: 'nosso pré-preenchido', cor: '#64748b', bg: '#f1f5f9' },
}

export function PainelRespostaEscola({ d }: { d: DadosPainel }) {
  const enviou = ['respondida', 'validada', 'cadastrada'].includes(d.status)
  const preenchendo = d.status === 'em_preenchimento'

  const visiveis = CAMPOS.filter(c => !c.interno && c.tipo !== 'calculado' && campoVisivel(c, d.dados))
  const cont = { escola: 0, confirmado: 0, corrigido: 0, pre: 0, branco: 0 }
  for (const c of visiveis) {
    if (c.tipo === 'logo') { if (!d.logoUrl) cont.branco++; else cont.escola++; continue }
    if (vazio(d.dados[c.chave])) { cont.branco++; continue }
    const s = d.situacao[c.chave]
    if (s === 'preenchido_escola') cont.escola++
    else if (s === 'confirmado') cont.confirmado++
    else if (s === 'corrigido') cont.corrigido++
    else cont.pre++
  }
  const respostasEscola = cont.escola + cont.confirmado + cont.corrigido

  const manchete = enviou
    ? { ic: '✔', txt: `A escola ENVIOU as respostas${d.respondidaEm ? ' em ' + fd(d.respondidaEm) : ''}.`, sub: d.status === 'respondida' ? 'Falta o comercial conferir e validar a ficha.' : d.status === 'validada' ? 'Validada pelo comercial. Falta cadastrar na Eskolare.' : 'Já cadastrada na Eskolare.', cor: '#047857', bg: '#ecfdf5' }
    : preenchendo
    ? { ic: '✎', txt: `A escola começou a preencher, mas AINDA NÃO enviou (${d.pct}% preenchido).`, sub: 'O que aparece abaixo é rascunho salvo automaticamente. Só vale como resposta final depois que a escola clicar em "Enviar respostas".', cor: '#b45309', bg: '#fffbeb' }
    : d.status === 'enviada' && d.ultimoAcesso
    ? { ic: '👁', txt: 'A escola abriu o link, mas ainda não preencheu nada.', sub: `Último acesso: ${fd(d.ultimoAcesso)}.`, cor: '#0369a1', bg: '#f0f9ff' }
    : d.status === 'enviada'
    ? { ic: '📨', txt: 'Link enviado: a escola ainda não abriu.', sub: 'Vale lembrar a escola pelo WhatsApp.', cor: '#0369a1', bg: '#f0f9ff' }
    : { ic: '•', txt: 'Ficha interna: o link ainda não foi enviado à escola.', sub: 'Gere o link e o PIN abaixo para enviar.', cor: '#475569', bg: '#f8fafc' }

  const etapas = [
    { n: 'Link enviado', q: d.enviadaEm, ok: !!d.enviadaEm || d.status !== 'rascunho' },
    { n: 'Escola abriu', q: d.abertaEm ?? d.ultimoAcesso, ok: !!(d.abertaEm ?? d.ultimoAcesso) || preenchendo || enviou },
    { n: 'Começou a preencher', q: d.comecouEm, ok: preenchendo || enviou },
    { n: 'Enviou as respostas', q: d.respondidaEm, ok: enviou },
    { n: 'Validada', q: d.validadaEm, ok: ['validada', 'cadastrada'].includes(d.status) },
    { n: 'Cadastrada na Eskolare', q: d.cadastradaEm, ok: d.status === 'cadastrada' },
  ]

  const exibir = (c: Campo, v: string) => (c.tipo === 'cpf' && !d.ehGerente ? mascararCpf(v) : v)
  const kpi = (r: string, v: number | string, cor: string) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `3px solid ${cor}`, borderRadius: 10, padding: '.5rem .8rem' }}>
      <div style={{ fontSize: '.64rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>{r}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{v}</div>
    </div>
  )

  return (
    <section aria-label="Painel das respostas da escola" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.2rem' }}>
      <div style={{ background: manchete.bg, border: `1px solid ${manchete.cor}33`, borderLeft: `5px solid ${manchete.cor}`, borderRadius: 10, padding: '.8rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 800, color: manchete.cor, fontSize: '1rem' }}>{manchete.ic} {manchete.txt}</div>
        <div style={{ fontSize: '.8rem', color: '#475569', marginTop: '.2rem' }}>{manchete.sub}</div>
      </div>

      <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.5rem', listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
        {etapas.map(e => (
          <li key={e.n} style={{ borderRadius: 10, padding: '.5rem .7rem', background: e.ok ? '#ecfdf5' : '#f8fafc', border: `1px solid ${e.ok ? '#a7f3d0' : '#e2e8f0'}`, opacity: e.ok ? 1 : 0.65 }}>
            <div style={{ fontSize: '.74rem', fontWeight: 800, color: e.ok ? '#047857' : '#64748b' }}>{e.ok ? '✔' : '○'} {e.n}</div>
            <div style={{ fontSize: '.68rem', color: '#64748b' }}>{e.ok ? (fd(e.q) ?? 'concluído') : 'pendente'}</div>
          </li>
        ))}
      </ol>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.6rem', marginBottom: '1rem' }}>
        {kpi('Preenchimento', `${d.pct}%`, d.pct === 100 ? '#059669' : '#0ea5e9')}
        {kpi('Respostas da escola', respostasEscola, '#047857')}
        {kpi('Corrigidos pela escola', cont.corrigido, '#b45309')}
        {kpi('Só pré-preenchidos', cont.pre, '#64748b')}
        {kpi('Em branco', cont.branco, cont.branco ? '#dc2626' : '#94a3b8')}
        {kpi('Total de alunos', totalAlunos(d.dados), '#7c3aed')}
      </div>

      <h3 style={{ fontSize: '.95rem', margin: '0 0 .6rem' }}>{enviou ? 'Dados enviados pela escola' : 'Dados recebidos até agora (rascunho)'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '.8rem' }}>
        {BLOCOS.map(b => {
          const cs = visiveis.filter(c => c.bloco === b.id)
          if (!cs.length) return null
          const feitos = cs.filter(c => (c.tipo === 'logo' ? !!d.logoUrl : !vazio(d.dados[c.chave]))).length
          const p = Math.round((feitos / cs.length) * 100)
          return (
            <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '.5rem .8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 800 }}><span>{b.id}. {b.titulo}</span><span style={{ color: p === 100 ? '#047857' : '#64748b' }}>{feitos}/{cs.length}</span></div>
                <div style={{ height: 5, background: '#e2e8f0', borderRadius: 9999, marginTop: '.3rem' }}><div style={{ width: `${p}%`, height: '100%', background: p === 100 ? '#059669' : '#0ea5e9', borderRadius: 9999 }} /></div>
              </div>
              <dl style={{ margin: 0, padding: '.5rem .8rem', display: 'grid', gap: '.35rem', fontSize: '.78rem' }}>
                {cs.map(c => {
                  const v = d.dados[c.chave] ?? ''
                  const t = TAG[d.situacao[c.chave] ?? 'pre']
                  return (
                    <div key={c.chave}>
                      <dt style={{ color: '#64748b', fontSize: '.68rem', fontWeight: 700 }}>{c.rotulo}</dt>
                      <dd style={{ margin: 0, fontWeight: 600, wordBreak: 'break-word' }}>
                        {c.tipo === 'logo'
                          ? (d.logoUrl ? <img src={d.logoUrl} alt="Logo enviada pela escola" style={{ maxHeight: 44, border: '1px solid #e2e8f0', borderRadius: 6, padding: 3 }} /> : <span style={{ color: '#dc2626' }}>não enviada</span>)
                          : vazio(v) ? <span style={{ color: '#dc2626', fontWeight: 600 }}>em branco</span> : exibir(c, v)}
                        {!vazio(v) && c.tipo !== 'logo' && t && <span style={{ marginLeft: '.4rem', fontSize: '.6rem', fontWeight: 700, color: t.cor, background: t.bg, borderRadius: 9999, padding: '.05rem .4rem' }}>{t.t}</span>}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          )
        })}
      </div>
    </section>
  )
}
