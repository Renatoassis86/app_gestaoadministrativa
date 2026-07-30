import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=')
  if (idx === -1) continue
  env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const SENHA = '1234cve'

const USUARIOS = [
  { full_name: 'Patrícia',                 email: 'patricia@cidadeviva.org',                role: 'consultor', cargo: 'Diretora Administrativa' },
  { full_name: 'Thiago Dutra',              email: 'thiagodutra@cidadeviva.org',             role: 'consultor', cargo: 'Diretor Pedagógico' },
  { full_name: 'Raissa Fernandes',          email: 'raissa.fernandes@cidadeviva.org',        role: 'consultor', cargo: 'Consultoria Pedagógica' },
  { full_name: 'Layla Oliveira',            email: 'layla.oliveira@cidadeviva.org',          role: 'consultor', cargo: 'Coordenação Infantil' },
  { full_name: 'Coordenação Fundamental 2', email: 'biblos.educations@cidadeviva.org',       role: 'consultor', cargo: 'Coordenação Fundamental 2' },
  { full_name: 'Coordenação Fundamental 1', email: 'coordenacaof1.education@cidadeviva.org', role: 'consultor', cargo: 'Coordenação Fundamental 1' },
]

async function main() {
  console.log('\n━━━ Criando/atualizando logins — Briefing de Marketing ━━━\n')

  for (const u of USUARIOS) {
    process.stdout.write(`→ ${u.full_name} (${u.email})... `)

    const { data: authData, error: authErr } = await sb.auth.admin.createUser({
      email: u.email,
      password: SENHA,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    })

    let userId = authData?.user?.id
    let jaExistia = false

    if (authErr) {
      if (authErr.message.toLowerCase().includes('already')) {
        jaExistia = true
        const { data: list } = await sb.auth.admin.listUsers()
        const existing = list?.users?.find(x => x.email === u.email)
        userId = existing?.id
        if (userId) {
          const { error: updErr } = await sb.auth.admin.updateUserById(userId, { password: SENHA })
          if (updErr) { console.error(`ERRO ao atualizar senha: ${updErr.message}`); continue }
        }
        process.stdout.write('(já existia, senha atualizada) ')
      } else {
        console.error(`ERRO Auth: ${authErr.message}`)
        continue
      }
    }

    if (!userId) { console.error('ERRO: userId não encontrado'); continue }

    const { error: profileErr } = await sb
      .from('profiles')
      .upsert({
        id: userId,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_active: true,
      }, { onConflict: 'id' })

    if (profileErr) { console.error(`ERRO Profile: ${profileErr.message}`); continue }

    console.log(`✅ ${u.role.toUpperCase()}${jaExistia ? ' (já existia)' : ' (novo)'}`)
  }

  console.log('\n━━━ Confirmação final ━━━')
  const { data: profiles } = await sb.from('profiles').select('full_name, email, role, is_active').order('full_name')
  for (const u of USUARIOS) {
    const p = profiles?.find(x => x.email === u.email)
    console.log(`  ${p ? '✓' : '✗'} ${u.email} — role: ${p?.role ?? 'N/A'} — ativo: ${p?.is_active}`)
  }
}

main().catch(console.error)
