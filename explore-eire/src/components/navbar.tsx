"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../app/lib/authContext";
import { supabase } from "../app/lib/supabaseClient";
import logo2 from "../../public/images/newEElogoWOsymbol.png";
import "../app/globals.css";

// Sidebar Component with Collections
export default function Sidebar() {
    const { user } = useAuth();
    const [collections, setCollections] = useState([]);
    const [expandedCollection, setExpandedCollection] = useState<string | null>(null);

    // Fetch collections for logged-in user
    useEffect(() => {
        if (user) {
            fetchCollections(user.id);
        }
    }, [user]);

    const fetchCollections = async (userId: string) => {
        const { data, error } = await supabase
            .from("collections")
            .select(`
                id, name, created_at,
                user_collections (
                    location_id,
                    attractions (
                        id, Name, Address, Url, Telephone
                    )
                )
            `)
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching collections:", error.message);
        } else {
            setCollections(data || []);
        }
    };

    const handleCollectionClick = (collectionId: string) => {
        setExpandedCollection(expandedCollection === collectionId ? null : collectionId);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    return (
        <nav className="group fixed top-0 left-0 h-screen bg-background w-20 hover:w-64 transition-all duration-300 ease-in-out shadow-lg flex flex-col items-center z-50">
            {/* Logo */}
            <div className="h-20 flex items-center justify-center w-full relative">
                <Link href="/" legacyBehavior>
                    <a aria-label="Go to homepage">
                        <Image src={logo2} alt="Explore Eire Logo" width={50} height={50} />
                    </a>
                </Link>
            </div>

            {/* Sidebar Links */}
            <div className="flex flex-col mt-10 w-full space-y-3">
                <SidebarItem href="/" label="Homepage" icon="ri-home-line" />

                {/* Collections Section */}
                {user && (
                    <div className="w-full">
                        <div className="text-gray-600 text-sm px-4 mb-2">My Collections</div>
                        {collections.map((collection) => (
                            <button
                                key={collection.id}
                                onClick={() => handleCollectionClick(collection.id)}
                                className={`w-full px-4 py-2 flex justify-start items-center text-gray-700 rounded-md ${expandedCollection === collection.id ? "bg-gray-300" : "hover:bg-gray-100"
                                    }`}
                            >
                                <i className="ri-folder-line text-lg"></i>
                                <span className="ml-3">{collection.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                <SidebarItem href="/settings" label="Settings" icon="ri-settings-3-line" />
            </div>

            {/* Expanded Collection View */}
            {expandedCollection && (
                <div className="absolute left-full top-0 w-64 h-full bg-white shadow-lg p-4">
                    <h2 className="text-lg font-bold">
                        {collections.find((c) => c.id === expandedCollection)?.name}
                    </h2>
                    <p className="text-sm text-gray-500">Private | Share</p>

                    {/* List Attractions */}
                    <div className="mt-4 space-y-2">
                        {collections
                            .find((c) => c.id === expandedCollection)
                            ?.user_collections.map((item) => (
                                <div key={item.location_id} className="p-3 border rounded bg-gray-100">
                                    <h4 className="font-semibold">{item.attractions.Name}</h4>
                                    <p className="text-sm">{item.attractions.Address}</p>
                                    {item.attractions.Url && (
                                        <a
                                            href={item.attractions.Url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Log Out */}
            <div className="mt-auto mb-8 w-full">
                {user ? (
                    <>
                        <button onClick={handleSignOut} className="w-full text-red-500 hover:underline py-2">
                            Log Out
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center space-y-2">
                        <Link href="/register" legacyBehavior>
                            <a className="text-gray-600 hover:text-gray-900">Register</a>
                        </Link>
                        <Link href="/login" legacyBehavior>
                            <a className="text-gray-600 hover:text-gray-900">Login</a>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

// SidebarItem Component
function SidebarItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} legacyBehavior>
            <a className="flex items-center justify-start w-full px-4 py-3 text-gray-600 hover:text-gray-900 transition-all duration-300">
                <i className={`${icon} text-2xl`}></i>
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {label}
                </span>
            </a>
        </Link>
    );
}
