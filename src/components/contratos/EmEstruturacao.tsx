import { MODULO_CONTRATOS } from '@/lib/contratos-modulo'

export function EmEstruturacao({ href }: { href: string }) {
  const p = MODULO_CONTRATOS.paginas.find(x => x.href === href)
  return (
    <section style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 14, padding: '1.5rem', maxWidth: 760 }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{p?.nome}</h2>
      <p style={{ fontSize: '.85rem', color: '#475569', margin: '.4rem 0 .8rem' }}>{p?.descricao}</p>
      <span style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9999, padding: '.2rem .7rem' }}>Em estruturação</span>
      <p style={{ fontSize: '.8rem', color: '#64748b', marginTop: '.9rem' }}>Esta página será construída na ordem que a equipe priorizar.</p>
    </section>
  )
}
