'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function moverNegociacao(id: string, novoStage: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { error } = await supabase
    .from('negociacoes')
    .update({ stage: novoStage })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/pipeline')
  return { success: true }
}
