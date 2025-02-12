"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Navbar from "@/components/navbar";
import debounce from "lodash.debounce";


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
    const [searchTerm, setSearchTerm] = useState<string>(""); // ✅ Search input
    const [selectedFilter, setSelectedFilter] = useState<string>("All"); // ✅ Category filter
    const pageSize = 10; // Number of attractions per fetch

    // ✅ Fetch attractions from Supabase
    const fetchAttractions = async (search = "", filter = "All", pageNum = 1) => {
        setLoading(true);

        let query = supabase.from("attractions").select("*").order("Name", { ascending: true });

        // ✅ If searching, filter by name, county, or address
        if (search) {
            query = query.or(
                `Name.ilike.%${search}%,County.ilike.%${search}%,Address.ilike.%${search}%`
            );
        }

        // ✅ If filtering by category (make sure "Tags" is an array column in Supabase)
        if (filter !== "All") {
            query = query.textSearch("Tags", `"${filter}"`); // Fix for text-based filtering
        }

        // ✅ Fetch without pagination for accurate search results
        const { data, error } = await query;

        if (error) {
            console.error("Error fetching attractions:", error.message);
        } else {
            setAttractions(data.slice(0, pageSize)); // ✅ Apply pagination AFTER fetching
            setHasMore(data.length > pageSize); // ✅ Check if there's more data
        }

        setLoading(false);
    };

    // ✅ Load attractions on mount & when `page` changes
    useEffect(() => {
        fetchAttractions(searchTerm, selectedFilter, page);
    }, [page]);

    // ✅ Search & Filter Effect (Debounced for better UX)
    useEffect(() => {
        const debouncedFetch = debounce(() => {
            setPage(1); // ✅ Reset pagination when searching
            fetchAttractions(searchTerm, selectedFilter, 1);
        }, 500); // ✅ Wait 500ms before sending request

        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [searchTerm, selectedFilter]);


    // ✅ Handle scrolling (Load more when near bottom)
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
            <div className="container mx-auto px-6 mt-8 py-10 bg-gray-100 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6">Explore Attractions</h1>

                {/* Search Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by name, county, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>

                {/* Filter Dropdown */}
                <h2 className="mb-4">Filter by Tag:</h2>
                <select
                    id="tag-filter"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                >
                    <option value="All">All</option>
                    <option value="Activity">Activity</option>
                    <option value="Beach">Beach</option>
                    <option value="Castle">Castle</option>
                    <option value="Experience">Experience</option>
                    <option value="Fishing">Fishing</option>
                    <option value="Food">Food</option>
                    <option value="Golf">Golf</option>
                    <option value="Historic">Historic</option>
                    <option value="Learning">Learning</option>
                    <option value="Nature">Nature</option>
                    <option value="Tour">Tour</option>
                    <option value="Venue">Venue</option>
                    <option value="Walking">Walking</option>
                </select>
            </div>

            {/* Attractions Grid */}
            <div className="container mx-auto px-6 mt-8 py-10 bg-gray-100 rounded-lg shadow-md">
                {attractions.length === 0 && !loading ? (
                    <p className="text-center text-gray-500">No attractions found.</p>
                ) : (
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
                )}

                {/* Loading Indicator */}
                {loading && <p className="text-center mt-6">Loading more attractions...</p>}
            </div>
        </div>
    );
}
