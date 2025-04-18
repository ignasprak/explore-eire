'use server'
// server-side collection manipultor
import { supabaseServerClient } from '../lib/supabaseServerClient'
import { revalidatePath } from 'next/cache'

export async function createCollection(formData: FormData) {
    const name = formData.get('name') as string

    const supabase = supabaseServerClient()

    const { error } = await supabase
        .from('collections')
        .insert({ name })

    if (error) throw new Error(error.message)

    revalidatePath('/')
}
