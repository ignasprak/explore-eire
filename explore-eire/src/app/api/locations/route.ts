import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get("search") || "";
        const selectedFilter = searchParams.get("filter") || "All";
        const selectedCounty = searchParams.get("county") || "All";

        let query = supabase.from("attractions").select("*");

        // Apply search filter
        if (searchQuery) {
            query = query.ilike("Name", `%${searchQuery}%`);
        }

        // Apply category filter
        if (selectedFilter !== "All") {
            query = query.ilike("Tags", `%${selectedFilter}%`);
        }

        // Apply county filter
        if (selectedCounty !== "All") {
            query = query.eq("County", selectedCounty);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
    }
}
