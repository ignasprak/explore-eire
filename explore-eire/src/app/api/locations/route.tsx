import { NextResponse } from "next/server";
import { supabase } from '../../lib/supabaseClient';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get("search") || "";
        const filters = searchParams.get("filters") || "";
        const counties = searchParams.get("counties") || "";
        const selectedTags = filters.split(",").filter(tag => tag);
        const selectedCounties = counties.split(",").filter(county => county);

        let query = supabase.from("attractions").select("*");

        if (!searchQuery && selectedTags.length === 0 && selectedCounties.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // please i hope these ilike functions work like a charm
        if (searchQuery) {
            query = query.ilike("Name", `%${searchQuery}%`);
        }

        if (selectedTags.length > 0) {
            selectedTags.forEach(tag => {
                query = query.ilike("Tags", `%${selectedTags}%`);
            });
        }

        if (selectedCounties.length > 0) {
            query = query.in("County", selectedCounties);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
    }
}
