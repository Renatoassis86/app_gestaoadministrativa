import { createClient } from '@supabase/supabase-js'

// Variáveis coladas de arquivos do Windows podem vir com BOM (U+FEFF) ou espaços/quebras no início/fim,
// o que faz o fetch recusar o header de autorização ("Cannot convert argument to a ByteString").
const limpa = (v?: string) => (v ?? '').replace(/^﻿/, '').trim()

export function createAdminClient() {
  return createClient(
    limpa(process.env.NEXT_PUBLIC_SUPABASE_URL),
    limpa(process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { persistSession: false } },
  )
}
