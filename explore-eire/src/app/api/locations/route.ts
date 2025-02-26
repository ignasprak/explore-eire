import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get("search") || "";
        const filters = searchParams.get("filters") || "";
        const selectedCounty = searchParams.get("county") || "All";

        const selectedTags = filters.split(",").filter(tag => tag);

        let query = supabase.from("attractions").select("*");

        if (searchQuery) {
            query = query.ilike("Name", `%${searchQuery}%`);
        }

        if (selectedTags.length > 0) {
            selectedTags.forEach(tag => {
                query = query.ilike("Tags", `%${tag}%`);
            });
        }

        if (selectedCounty !== "All") {
            query = query.eq("County", selectedCounty);
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
