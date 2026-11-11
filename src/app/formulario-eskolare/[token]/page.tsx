import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { tokenPlausivel } from '@/lib/eskolare-seguranca'
import { fichaDaSessao, montarFichaPublica } from '@/lib/eskolare-sessao'
import { TelaPin } from '@/components/eskolare/TelaPin'
import { FormularioEskolarePublico } from '@/components/eskolare/FormularioEskolarePublico'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Cadastro da loja Eskolare 2027 — Cidade Viva Education',
  robots: { index: false, follow: false },        // link privado: nunca indexar
}

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a url(/images/hero-modulos.png) center/cover fixed', padding: '1.2rem .8rem 2.5rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '.6rem 0 1.1rem' }}>
          <img src="/images/logo-education.png" alt="Cidade Viva Education" style={{ height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 18, padding: '1.25rem', boxShadow: '0 18px 50px rgba(0,0,0,.35)' }}>{children}</div>
        <p style={{ textAlign: 'center', fontSize: '.7rem', color: 'rgba(255,255,255,.6)', marginTop: '1rem' }}>Cidade Viva Education © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

export default async function CadastroEskolarePublico({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invalido = (
    <Moldura>
      <h1 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.7rem', margin: '0 0 .6rem' }}>Link indisponível</h1>
      <p style={{ color: '#475569', lineHeight: 1.55, margin: 0 }}>Este link não é válido ou foi desativado. Peça um novo link ao seu contato na Cidade Viva Education.</p>
    </Moldura>
  )
  if (!tokenPlausivel(token)) return invalido

  const admin = createAdminClient()
  const sessao = await fichaDaSessao(admin, token)
  if (sessao) return <Moldura><FormularioEskolarePublico token={token} inicial={await montarFichaPublica(admin, sessao)} /></Moldura>

  const { data: f } = await admin.from('eskolare_fichas').select('escola_id, dados, link_revogado').eq('token', token).maybeSingle()
  if (!f || f.link_revogado) return invalido
  const { data: e } = await admin.from('escolas').select('nome').eq('id', f.escola_id).maybeSingle()
  return <Moldura><TelaPin token={token} escolaNome={f.dados?.nome_loja || e?.nome || 'Sua escola'} /></Moldura>
}
