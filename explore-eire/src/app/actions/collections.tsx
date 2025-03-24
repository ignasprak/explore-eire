'use server'

import { supabaseServerClient } from '@lib/supabaseClient'
import { revalidatePath } from 'next/cache'

export async function createCollection(formData: FormData) {
    const name = formData.get('name') as string

    const supabase = supabaseServerClient()

    const { error } = await supabase
        .from('collections')
        .insert({ name })

    if (error) throw new Error(error.message)

    revalidatePath('/') // Re-fetch sidebar data if needed
}
