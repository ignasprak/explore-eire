"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../app/lib/authContext";
import { supabase } from "../app/lib/supabaseClient";
import logo2 from "../../public/images/newEElogoWOsymbol.png";
import "../app/globals.css";
import { useMap } from '@/context/MapContext';
import { useCollectionsContext } from "@/context/CollectionsContext";

// Sidebar Component with Collections
export default function Navbar() {
    const { user } = useAuth();
    const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
    const isCollectionOpen = expandedCollection !== null;
    const { setLocations } = useMap();
    const { collections, refetchCollections, deleteCollection } = useCollectionsContext();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleCollectionClick = (collectionId: string) => {
        const isSame = expandedCollection === collectionId;

        // Toggle open/close
        setExpandedCollection(isSame ? null : collectionId);

        if (isSame) {
            setLocations([]); // Clear the map if closing the panel
            return;
        }

        const selectedCollection = collections.find((c) => c.id === collectionId);

        if (!selectedCollection) return;

        const attractions = selectedCollection.user_collections
            .map((uc) => uc.attractions)
            .filter(Boolean) // remove null/undefined
            .map((a) => ({
                id: a.id,
                Name: a.Name,
                Address: a.Address,
                County: a.County ?? '',
                Telephone: a.Telephone ?? '',
                Url: a.Url ?? '',
                Tags: a.Tags ?? '',
                Latitude: a.Latitude,
                Longitude: a.Longitude,
            }));

        console.log("Set collection attractions to map:", attractions);
        setLocations(attractions);
        setMobileMenuOpen(false);

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

    const handleRemoveAttraction = async (collectionId: string, locationId: string) => {
        if (!collectionId || !locationId) return;

        const isConfirmed = window.confirm("Are you sure you want to remove this attraction?");
        if (!isConfirmed) return;

        console.log("Removing attraction with id:", locationId, "from collection:", collectionId);

        const { error } = await supabase
            .from("user_collections")
            .delete()
            .match({ collection_id: collectionId, location_id: locationId });

        if (error) {
            console.error("Error removing attraction:", error.message);
            alert("Failed to remove attraction.");
        } else {
            await refetchCollections();
        }
    };

    return (
        <>
            <nav className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-white shadow-lg flex-col items-center z-50">

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

                    {/* Collections Section */}
                    {user && (
                        <div className="w-full">
                            <div className="text-gray-600 text-xs items-center px-4 mb-2">Collections</div>
                            {collections.map((collection) => (
                                <button
                                    key={collection.id}
                                    onClick={() => handleCollectionClick(collection.id)}
                                    className="w-full flex flex-col items-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                                >
                                    <i className="ri-folder-line text-xl mb-1"></i> {/* Bigger icon + spacing */}
                                    <span className="text-xs text-center w-full">{collection.name}</span>
                                </button>

                            ))}
                        </div>
                    )}

                </div>

                {/* Expanded Collection View */}
                {expandedCollection && (
                    <div className="absolute left-full top-0 w-96 h-full bg-white shadow-lg p-4 z-30">
                        <h2 className="text-lg font-bold">
                            {collections.find((c) => c.id === expandedCollection)?.name}
                        </h2>
                        <p className="text-sm text-gray-500">Private | Share</p>
                        <button
                            onClick={async () => {
                                if (!expandedCollection) return;

                                const isConfirmed = window.confirm("Are you sure you want to delete this collection?");
                                if (!isConfirmed) return;

                                console.log("deleting collection with id:", expandedCollection);
                                await deleteCollection(expandedCollection);
                                setExpandedCollection(null); // collapses the view
                                setLocations([]); // clear map markers
                                await refetchCollections();

                            }}

                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Delete Collection
                        </button>


                        {/* List Attractions */}
                        <div className="mt-4 space-y-2">
                            {collections
                                .find((c) => c.id === expandedCollection)
                                ?.user_collections.map((item) => (
                                    <div key={item.location_id} className="p-3 border rounded bg-gray-100 flex justify-between items-center">
                                        <div>
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
                                        {/* Delete Button (Remix "X" Icon) */}
                                        <button
                                            onClick={() => handleRemoveAttraction(expandedCollection, item.location_id)}
                                            className="text-gray-500 hover:text-red-500 transition"
                                        >
                                            <i className="ri-close-line text-xl"></i> {/* Remix "X" Icon */}
                                        </button>
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

            {/* Mobile Hamburger Button */}
            {!mobileMenuOpen && (
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden fixed top-4 left-4 z-[1000] bg-white rounded-full p-2 shadow-lg"
                >
                    <i className="ri-menu-line text-2xl text-gray-700"></i>
                </button>
            )}

            {/* Mobile Slide Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-[999] transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
            >

                {/* Header with Logo & Close */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <Image src={logo2} alt="Logo" width={40} height={40} />
                    <button onClick={() => setMobileMenuOpen(false)}>
                        <i className="ri-close-line text-2xl text-gray-600"></i>
                    </button>
                </div>

                {/* Mobile Collections */}
                <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-500">Collections</h3>
                    {collections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => {
                                handleCollectionClick(collection.id);
                                setMobileMenuOpen(false); // close menu on click
                            }}
                            className="flex items-center w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                        >
                            <i className="ri-folder-line text-lg mr-2 text-gray-600"></i>
                            <span className="text-sm">{collection.name}</span>
                        </button>
                    ))}
                </div>

                {/* Log Out */}
                <div className="mt-auto p-4">
                    {user && (
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                localStorage.clear();
                                sessionStorage.clear();
                                location.reload();
                            }}
                            className="w-full text-left text-red-600 text-sm"
                        >
                            Log Out
                        </button>
                    )}
                </div>
            </div >
        </>
    );
}

// SidebarItem Component
function SidebarItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} legacyBehavior>
            <a className="flex flex-col items-center justify-center w-full py-2 text-gray-600 hover:text-gray-900 transition-all duration-300">
                <i className={`${icon} text-2xl`}></i>
                <span>
                    {label}
                </span>
            </a>
        </Link>
    );
}