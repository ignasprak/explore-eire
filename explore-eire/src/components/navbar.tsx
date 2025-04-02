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
import { useTripsContext } from "@/context/TripsContext";
import { useSelectedAttraction } from '@/context/SelectedAttractionContext';
import { TripAttractionList } from "./trips/TripAttractionList";
import DndWrapper from '@/components/dnd/DndWrapper';

import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "react-beautiful-dnd";


// Sidebar Component with Collections
export default function Navbar() {
    const { user } = useAuth();
    const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
    const isCollectionOpen = expandedCollection !== null;
    const { setLocations } = useMap();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newTripName, setNewTripName] = useState('');
    const { collections, refetchCollections, deleteCollection, createCollection } = useCollectionsContext();
    const { trips, createTrip, refetchTrips, deleteTrip } = useTripsContext();
    const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
    const { setSelectedAttraction } = useSelectedAttraction();
    const [orderedItems, setOrderedItems] = useState<any[]>([]);

    const handleCollectionClick = (collectionId: string) => {
        setExpandedTrip(null); // Close any trip
        setExpandedCollection(collectionId); // Always open the selected collection

        const selectedCollection = collections.find((c) => c.id === collectionId);
        if (!selectedCollection) return;

        const attractions = selectedCollection.user_collections
            .map((uc) => uc.attractions)
            .filter(Boolean)
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

    const handleRemoveAttractionFromTrip = async (tripId: string, locationId: string) => {
        const confirmed = window.confirm("Remove this attraction from the trip?");
        if (!confirmed) return;

        const { error } = await supabase
            .from("user_trips")
            .delete()
            .match({ trip_id: tripId, location_id: locationId });

        if (error) {
            console.error("Failed to remove from trip", error.message);
        } else {
            await refetchTrips();
        }
    };

    useEffect(() => {
        if (!expandedTrip) return;

        const trip = trips.find((t) => t.id === expandedTrip);
        if (!trip) return;

        const sorted = [...trip.user_trips].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setOrderedItems(sorted);
    }, [expandedTrip, trips]);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !expandedTrip) return;

        const reordered = Array.from(orderedItems);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);

        setOrderedItems(reordered);

        await Promise.all(
            reordered.map((item, index) =>
                supabase
                    .from("user_trips")
                    .update({ position: index })
                    .match({ trip_id: expandedTrip, location_id: item.location_id })
            )
        );

        await refetchTrips();
    };



    {


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

                        {/* Create Button */}
                        <div className="relative w-full">
                            <button
                                onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                                className="w-full flex flex-col items-center justify-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                            >
                                <i className="ri-add-circle-line text-xl mb-1"></i>
                                <span className="text-xs">Create</span>
                            </button>

                            {/* Dropdown Menu */}
                            {createDropdownOpen && (
                                <div className="absolute left-full top-0 ml-2 w-60 bg-white border border-gray-200 shadow-lg rounded z-50 p-3 space-y-4">
                                    {/* New Collection */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">New Collection</p>
                                        <input
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            placeholder="Collection name"
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                        <button
                                            onClick={async () => {
                                                if (newCollectionName.trim()) {
                                                    await createCollection(newCollectionName.trim());
                                                    setNewCollectionName('');
                                                    setCreateDropdownOpen(false);
                                                } else {
                                                    alert('Please enter a collection name.');
                                                }
                                            }}
                                            className="mt-2 w-full bg-green-500 text-white text-sm py-1 rounded hover:bg-green-600"
                                        >
                                            Create Collection
                                        </button>
                                    </div>

                                    {/* New Trip */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">New Trip</p>
                                        <input
                                            type="text"
                                            value={newTripName}
                                            onChange={(e) => setNewTripName(e.target.value)}
                                            placeholder="Trip name"
                                            className="w-full p-2 border rounded text-sm"
                                        />
                                        <button
                                            onClick={async () => {
                                                if (newTripName.trim()) {
                                                    await createTrip(newTripName.trim());
                                                    setNewTripName("");
                                                    setCreateDropdownOpen(false);
                                                } else {
                                                    alert("Please enter a trip name.");
                                                }
                                            }}
                                            className="mt-2 w-full bg-green-500 text-white text-sm py-1 rounded hover:bg-green-600"
                                        >
                                            Create New Trip
                                        </button>


                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Collections Section */}
                        {user && (
                            <div className="w-full">
                                <div className="text-gray-600 items-center text-xs mb-2">Collections</div>
                                {collections.map((collection) => (
                                    <button
                                        key={collection.id}
                                        onClick={() => handleCollectionClick(collection.id)}
                                        className="w-full flex flex-col items-center justify-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <i className="ri-folder-line text-xl mb-1"></i>
                                            <span className="text-xs">{collection.name}</span>
                                        </div>
                                    </button>
                                ))}

                            </div>
                        )}

                        {/* Trip Section */}
                        <div className="text-gray-600 text-xs items-center px-4 mt-6 mb-2">Trips</div>
                        {trips.map((trip) => (
                            <button
                                key={trip.id}
                                onClick={() => {
                                    setExpandedCollection(null); // collapse collections
                                    setExpandedTrip(trip.id); // open trip

                                    const selectedTrip = trips.find((t) => t.id === trip.id);
                                    if (!selectedTrip) return;

                                    const attractions = selectedTrip.user_trips
                                        .map((ut) => ut.attractions)
                                        .filter(Boolean)
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

                                    setLocations(attractions);
                                }}

                                className="w-full flex flex-col items-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                            >
                                <i className="ri-compass-3-line text-xl mb-1"></i>
                                <span className="text-xs text-center w-full">{trip.name}</span>
                            </button>
                        ))}


                    </div>

                    {/* Expanded Collection View */}
                    {expandedCollection && (
                        <div className="absolute left-full top-0 w-96 h-full bg-white shadow-lg p-4 z-30">
                            <h2 className="text-lg font-bold">
                                {collections.find((c) => c.id === expandedCollection)?.name}
                            </h2>

                            <button
                                onClick={async () => {
                                    if (!expandedCollection) return;

                                    const isConfirmed = window.confirm("Are you sure you want to delete this collection?");
                                    if (!isConfirmed) return;

                                    console.log("deleting collection with id:", expandedCollection);
                                    await deleteCollection(expandedCollection);
                                    setExpandedCollection(null);
                                    setExpandedTrip(null); // collapses the view
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
                                        <div key={item.location_id} className="p-3 border rounded bg-gray-100">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            setSelectedAttraction({
                                                                ...item.attractions,
                                                                source: 'collection',
                                                                collectionId: expandedCollection!,
                                                            })
                                                        }
                                                    >
                                                        <h4 className="font-semibold">{item.attractions.Name}</h4>
                                                        <p className="text-sm">{item.attractions.Address}</p>
                                                    </div>

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

                                                {/* Remove from collection */}
                                                <button
                                                    onClick={() => handleRemoveAttraction(expandedCollection, item.location_id)}
                                                    className="text-gray-500 hover:text-red-500 transition"
                                                >
                                                    <i className="ri-close-line text-xl"></i>
                                                </button>
                                            </div>

                                            {/* === Add to Trip Dropdown === */}
                                            {trips.length > 0 && (
                                                <div className="mt-3">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Add to Trip</label>
                                                    <select
                                                        className="w-full border text-sm rounded p-1"
                                                        defaultValue=""
                                                        onChange={async (e) => {
                                                            const selectedTripId = e.target.value;
                                                            if (!selectedTripId) return;

                                                            const { error } = await supabase.from("user_trips").insert({
                                                                trip_id: selectedTripId,
                                                                location_id: item.location_id,
                                                                user_id: user?.id,
                                                                metadata: JSON.stringify({ addedFrom: "collection" }), // optional
                                                            });

                                                            if (error) {
                                                                console.error("Failed to add to trip:", error.message);
                                                                alert("Failed to add attraction to trip.");
                                                            } else {
                                                                await refetchTrips();
                                                                alert("Attraction added to trip!");
                                                            }

                                                            e.target.value = "";
                                                        }}



                                                    >
                                                        <option value="" disabled>Select trip...</option>
                                                        {trips.map((trip) => (
                                                            <option key={trip.id} value={trip.id}>
                                                                {trip.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                            </div>

                        </div>
                    )}

                    {/* Expanded Trip View */}
                    {expandedTrip && (
                        <div className="absolute left-full top-0 w-96 h-full bg-white shadow-lg p-4 z-30">
                            <h2 className="text-lg font-bold">
                                {trips.find((t) => t.id === expandedTrip)?.name}
                            </h2>

                            <button
                                onClick={async () => {
                                    const isConfirmed = window.confirm("Are you sure you want to delete this trip?");
                                    if (!isConfirmed) return;

                                    await deleteTrip(expandedTrip);
                                    setExpandedTrip(null);
                                    await refetchTrips();
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition mb-4"
                            >
                                Delete Trip
                            </button>

                            {/* Drag & Drop Wrapper */}
                            <DndWrapper>
                                <TripAttractionList
                                    items={orderedItems}
                                    setItems={setOrderedItems}
                                    onSelect={(item) =>
                                        setSelectedAttraction({
                                            ...item.attractions,
                                            source: "trip",
                                            tripId: expandedTrip!,
                                        })
                                    }
                                    onRemove={async (item) => {
                                        await handleRemoveAttractionFromTrip(expandedTrip!, item.location_id);
                                    }}
                                />
                            </DndWrapper>
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
}