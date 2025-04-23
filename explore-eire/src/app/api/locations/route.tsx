import { NextResponse } from "next/server";
import { supabase } from '../../lib/supabaseClient';

export async function GET(req: Request) {
    try {
        // pull all query parameters out of the URL
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get("search") || "";
        const filters = searchParams.get("filters") || "";
        const counties = searchParams.get("counties") || "";

        // process filters into actual arrays
        const selectedTags = filters.split(",").filter(tag => tag);
        const selectedCounties = counties.split(",").filter(county => county);

        // start with a base query
        let query = supabase.from("attractions").select("*");

        // if no filters at all, just return empty aray
        if (!searchQuery && selectedTags.length === 0 && selectedCounties.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // name-based search
        if (searchQuery) {
            query = query.ilike("Name", `%${searchQuery}%`);
        }

        // if tags were selected, match each as a substring
        if (selectedTags.length > 0) {
            selectedTags.forEach(tag => {
                query = query.ilike("Tags", `%${tag}%`);
            });
        }

        // only show results from selected counties
        if (selectedCounties.length > 0) {
            query = query.in("County", selectedCounties);
        }

        // run da query
        const { data, error } = await query;
        // error cacth
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        // class stuff
        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
    }
}
