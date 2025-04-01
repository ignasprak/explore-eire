import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(req: NextRequest) {
    const { collectionId, locationId } = await req.json();

    if (!collectionId || !locationId) {
        return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('user_collections')
        .insert([{ collection_id: collectionId, location_id: locationId }]);

    if (error) {
        console.error('Error adding to collection:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}