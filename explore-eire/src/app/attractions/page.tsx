"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Navbar from "@/components/navbar";

interface Attraction {
    id: string;
    Name: string;
    ImageUrl: string;
    Address: string;
    County: string;
    Tags: string;
    Url: string;
}

export default function AttractionsPage() {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const pageSize = 10; // Number of attractions per fetch

    // ✅ Fetch attractions from Supabase
    const fetchAttractions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("attractions")
            .select("*")
            .order("Name", { ascending: true })
            .range((page - 1) * pageSize, page * pageSize - 1); // Pagination

        if (error) {
            console.error("Error fetching attractions:", error.message);
        } else {
            if (data.length < pageSize) {
                setHasMore(false);
            }
            setAttractions((prev) => [...prev, ...data]);
        }
        setLoading(false);
    };

    // ✅ Load attractions on mount & when `page` changes
    useEffect(() => {
        fetchAttractions();
    }, [page]);

    // ✅ Handle scrolling (load more when near bottom)
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
                !loading &&
                hasMore
            ) {
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    return (
        <div className="min-h-screen bg-tertiary-100">
            <Navbar />
            <div className="container m-8 w-full bg-gray-500 p-8">
                THIS IS WHERE THE SEARCH FUNCTION WILL BE
            </div>
            <div className="container mx-auto px-6 mt-8 py-10 bg-gray-100">
                <h1 className="text-3xl font-bold text-center mb-6">Attractions</h1>

                {/* Attractions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {attractions.map((attraction) => (
                        <div
                            key={attraction.id}
                            className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full"
                        >
                            {/* Future image support */}
                            {/* <img
                                src={attraction.ImageUrl || "/placeholder.jpg"}
                                alt={attraction.Name}
                                className="w-full h-40 object-cover rounded-lg"
                            /> */}

                            {/* Content Container */}
                            <div className="flex-grow">
                                <h2 className="text-lg font-bold">{attraction.Name}</h2>
                                <p className="text-gray-500">Co. {attraction.County}</p>
                                <p className="text-sm text-gray-700">{attraction.Address}</p>
                            </div>

                            {/* Footer (Button & Link) */}
                            <div className="mt-auto">
                                <button className="bg-primary text-lg p-2 w-full rounded-lg hover:bg-highlight">
                                    Add To Collection
                                </button>
                                <a
                                    href={attraction.Url}
                                    target="_blank"
                                    className="block text-blue-500 font-semibold mt-2 text-center"
                                >
                                    Go To Website →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>



                {/* Loading Indicator */}
                {loading && <p className="text-center mt-6">Loading more attractions...</p>}
            </div>
        </div>
    );
}
