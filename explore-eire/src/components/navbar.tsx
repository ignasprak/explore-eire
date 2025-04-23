"use client";

// global variable used for scroll wheels when it comes to an overflow of trips or collections
const SCROLL_CLASS = "overflow-y-auto scrollbar-thin lg:max-h-[240px] md:max-h-[160px]";

// imports
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
import type { Location } from "@/types/location";
import { useConfirm } from "./confirmProvider";

// marker colours for different day trips
export const markerColors: Record<number, string> = {
    0: "/images/markers/map-marker-red.svg",
    1: "/images/markers/map-marker-orange.svg",
    2: "/images/markers/map-marker-yellow.svg",
    3: "/images/markers/map-marker-green.svg",
    4: "/images/markers/map-marker-blue.svg",
    5: "/images/markers/map-marker-indigo.svg",
    6: "/images/markers/map-marker-violet.svg",
};

// main component
export default function Navbar() {
    const { user } = useAuth();
    const [expandedCollection, setExpandedCollection] = useState<string | null>(null);
    const isCollectionOpen = expandedCollection !== null;
    const { setLocations } = useMap();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
    const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newTripName, setNewTripName] = useState('');
    const { collections, refetchCollections, deleteCollection, createCollection } = useCollectionsContext();
    const { trips, createTrip, refetchTrips, deleteTrip } = useTripsContext();
    const { setSelectedAttraction } = useSelectedAttraction();
    const [groupedItems, setGroupedItems] = useState<Record<number, any[]>>({});
    const [allDays, setAllDays] = useState<number[]>([]);
    const confirm = useConfirm();
    const [settingsExpanded, setSettingsExpanded] = useState(false);

    // what happens when the user clicks on a collection
    const handleCollectionClick = (collectionId: string) => {
        if (expandedCollection === collectionId) {
            setExpandedCollection(null);
            setLocations([]);
            return;
        }

        setExpandedTrip(null);
        setExpandedCollection(collectionId);

        const selectedCollection = collections.find(c => c.id === collectionId);
        if (!selectedCollection) return;

        // map Failte API fields to custom Location type
        const attractions: Location[] = selectedCollection.user_collections
            .filter(uc => uc.attractions)
            .map(uc => {
                const a = uc.attractions;

                return {
                    // bane of my existence, fixed with types/location.ts
                    id: a.id,
                    name: a.Name ?? a.name,
                    address: a.Address ?? a.address,
                    county: a.County ?? a.county ?? '',
                    telephone: a.Telephone ?? a.telephone ?? '',
                    url: a.Url ?? a.url ?? '',
                    tags: a.Tags ?? a.tags ?? '',
                    latitude: a.Latitude ?? a.latitude,
                    longitude: a.Longitude ?? a.longitude,
                    markerIcon: '/images/markers/map-marker-red.svg',
                };
            });

        setLocations(attractions);
        // for mobile
        setMobileMenuOpen(false);
    };

    // account management - sign out
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

    // process for removing an attraction
    const handleRemoveAttraction = async (collectionId: string, locationId: string) => {
        if (!collectionId || !locationId) return;
        // very cool confirmation
        const ok = await confirm("Remove this attraction?");
        if (!ok) return;

        // find the attraction user is trying to cancel
        const { error } = await supabase
            .from("user_collections")
            .delete()
            .match({ collection_id: collectionId, location_id: locationId });

        // error for development
        if (error) {
            console.error("Error removing attraction:", error.message);
            alert("Failed to remove attraction.");
        } else {
            // life continoues
            await refetchCollections();
        }
    };

    // attraction removal from trip view
    const handleRemoveAttractionFromTrip = async (tripId: string, locationId: string) => {
        // very cool confirmation
        const ok = await confirm("Remove this attraction?");
        if (!ok) return;

        // martching
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

    // if a trip is expanded, group its attractions by day
    useEffect(() => {
        if (!expandedTrip) return;

        const trip = trips.find((t) => t.id === expandedTrip);
        if (!trip) return;

        const grouped: Record<number, any[]> = {};
        const days = new Set<number>();

        trip.user_trips.forEach((ut) => {
            const day = ut.day ?? 0;
            days.add(day);
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(ut);
        });

        const sortedGrouped = Object.entries(grouped).reduce((acc, [day, unsortedTripItem]) => {
            acc[+day] = unsortedTripItem.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            return acc;
        }, {} as Record<number, any[]>);

        setGroupedItems(sortedGrouped);
        setAllDays([...days].sort((a, b) => a - b));
    }, [expandedTrip, trips]);

    // move an attraction to a different day and update backend
    const handleMoveDay = async (tripEntry: any, newDay: number) => {
        if (!expandedTrip) return;

        const { error } = await supabase
            .from("user_trips")
            .update({ day: newDay })
            .match({ trip_id: expandedTrip, location_id: tripEntry.location_id });

        if (error) {
            console.error("Error updating day", error.message);
            return;
        }

        // update
        await refetchTrips();

        const { data: updatedUserTrips, error: fetchError } = await supabase
            .from("user_trips")
            .select("*, attractions(*)")
            .eq("trip_id", expandedTrip);

        if (fetchError || !updatedUserTrips) {
            console.error("Error fetching updated trip after day move", fetchError?.message);
            return;
        }

        // for information in realtion to trips, including having the map marker for it when viewed
        const attractions: Location[] = updatedUserTrips.map((ut) => ({
            id: ut.attractions.id,
            name: ut.attractions.Name,
            address: ut.attractions.Address,
            county: ut.attractions.County ?? '',
            telephone: ut.attractions.Telephone ?? '',
            url: ut.attractions.Url ?? '',
            tags: ut.attractions.Tags ?? '',
            latitude: ut.attractions.Latitude,
            longitude: ut.attractions.Longitude,
            markerIcon: markerColors[ut.day ?? 0] || "/images/markers/map-marker-red.svg",
        }));

        setLocations(attractions);
    };

    // can't have more than 7 days...... limited by the colours of the rainbow 
    const handleAddNewDay = () => {
        if (allDays.length >= 7) {
            alert("Trip day limit reached. You can only have up to 7 days.");
            return;
        }

        const nextDay = allDays.length > 0 ? Math.max(...allDays) + 1 : 0;
        setAllDays((prev) => [...prev, nextDay]);
        setGroupedItems((prev) => ({ ...prev, [nextDay]: [] }));
    };

    const handleDeleteTrip = async (tripId: string) => {
        const ok = await confirm("Delete this trip?");
        if (!ok) return;

        await deleteTrip(tripId);

        setExpandedTrip(null);
        setLocations([]);
    };

    // UI TIME
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

                    {user && (
                        <>
                            {/* Sidebar Links */}
                            <div className="flex flex-col mt-10 w-full space-y-3">

                                {/* Create Button */}
                                <div className="relative w-full">
                                    <button
                                        onClick={() => {
                                            if (createDropdownOpen) {
                                                setCreateDropdownOpen(false);
                                            } else {
                                                setCreateDropdownOpen(true);
                                            }
                                        }}
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
                                                    className="mt-2 w-full bg-primary text-white text-sm py-1 rounded hover:bg-green-600"
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
                                                    className="mt-2 w-full bg-primary text-white text-sm py-1 rounded hover:bg-green-600"
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
                                            if (expandedTrip === trip.id) {
                                                setExpandedTrip(null);
                                                setLocations([]);
                                                return;
                                            }

                                            const selectedTrip = trips.find((t) => t.id === trip.id);
                                            if (!selectedTrip) return;

                                            setExpandedCollection(null);
                                            setExpandedTrip(trip.id);

                                            const attractions: Location[] = selectedTrip.user_trips
                                                .filter((ut) => ut.attractions)
                                                .map((ut) => {
                                                    const a = ut.attractions;
                                                    const markerIcon = markerColors[ut.day ?? 0] || "/images/markers/map-marker-red.svg";

                                                    return {
                                                        id: a.id,
                                                        name: a.Name,
                                                        address: a.Address,
                                                        county: a.County ?? '',
                                                        telephone: a.Telephone ?? '',
                                                        url: a.Url ?? '',
                                                        tags: a.Tags ?? '',
                                                        latitude: a.Latitude,
                                                        longitude: a.Longitude,
                                                        markerIcon,
                                                    };
                                                });

                                            setLocations(attractions);
                                        }}

                                        className="w-full flex flex-col items-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                                    >
                                        <i className="ri-compass-3-line text-xl mb-1"></i>
                                        <span className="text-xs text-center w-full">{trip.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Expanded Collection View */}
                    {expandedCollection && (
                        <div className="absolute left-full top-0 w-96 h-full bg-white shadow-lg p-4 z-30 flex flex-col">
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-4">
                                {/* Title and Delete */}
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-xl font-bold">
                                        {collections.find((c) => c.id === expandedCollection)?.name}
                                    </h2>

                                    {/* Delete */}
                                    <button
                                        onClick={async () => {
                                            if (!expandedCollection) return;
                                            const ok = await confirm("Are you sure you want to delete this collection?");
                                            if (!ok) return;
                                            await deleteCollection(expandedCollection);
                                            setExpandedCollection(null);
                                            setExpandedTrip(null);
                                            setLocations([]);
                                            await refetchCollections();
                                        }}
                                        className="text-gray-600 hover:text-red-500 transition"
                                        title="Delete Collection"
                                    >
                                        <i className="ri-delete-bin-line text-xl" />
                                    </button>
                                </div>

                                {/* Back */}
                                <button
                                    onClick={() => {
                                        setExpandedCollection(null);
                                        setLocations([]);
                                    }}
                                    className="text-gray-600 hover:text-blue-500 transition"
                                    title="Back to Search"
                                >
                                    <i className="ri-arrow-go-back-line text-xl" />
                                </button>
                            </div>

                            {/* List Attractions */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 rounded">
                                {collections.find((c) => c.id === expandedCollection)?.user_collections.map((item) => (
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

                                        {/* Add to Trip Dropdown */}
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
                                                            metadata: JSON.stringify({ addedFrom: "collection" }),
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
                                                    <option value="" disabled>Add to trip...</option>
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
                        <div className="absolute left-full top-0 w-96 h-full bg-white shadow-lg p-4 z-30 flex flex-col">
                            {/* Trip Header Row */}
                            <div className="flex items-center justify-between mb-4">
                                {/* Trip Title + Delete */}
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-xl font-bold">
                                        {trips.find((t) => t.id === expandedTrip)?.name}
                                    </h2>

                                    {/* Delete Trip */}
                                    <button
                                        onClick={async () => {
                                            const ok = await confirm("Delete this trip?");
                                            if (!ok) return;
                                            await deleteTrip(expandedTrip!);
                                            setExpandedTrip(null);
                                            await refetchTrips();
                                        }}
                                        className="text-gray-600 hover:text-red-500 transition"
                                        title="Delete Trip"
                                    >
                                        <i className="ri-delete-bin-line text-xl" />
                                    </button>
                                </div>

                                {/* Back to Search */}
                                <button
                                    onClick={() => {
                                        setExpandedTrip(null);
                                        setLocations([]);
                                    }}
                                    className="text-gray-600 hover:text-blue-500 transition"
                                    title="Back to Search"
                                >
                                    <i className="ri-arrow-go-back-line text-xl" />
                                </button>
                            </div>

                            {/* Add Day */}
                            <div className="flex justify-start mb-4">
                                <button
                                    onClick={handleAddNewDay}
                                    className="text-gray-600 hover:text-gray-800"
                                    disabled={allDays.length >= 7}
                                >
                                    <i className="ri-sun-line" /> New Day
                                </button>

                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-4">

                                {allDays.map((day) => (
                                    <div key={day} className="mb-4 border-t pt-2">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                            Day {day + 1}
                                        </h3>
                                        <TripAttractionList
                                            items={groupedItems[day] ?? []}
                                            currentDay={day}
                                            allDays={allDays}
                                            setItems={(updatedList) => {
                                                setGroupedItems((prev) => ({ ...prev, [day]: updatedList }));
                                            }}
                                            onSelect={(item) =>
                                                setSelectedAttraction({
                                                    ...item.attractions,
                                                    source: "trip",
                                                    tripId: expandedTrip!,
                                                })
                                            }
                                            onRemove={async (item) => {
                                                const updated = groupedItems[day]?.filter(
                                                    (i) => i.location_id !== item.location_id
                                                );
                                                setGroupedItems((prev) => ({ ...prev, [day]: updated }));
                                                await handleRemoveAttractionFromTrip(expandedTrip!, item.location_id);
                                            }}
                                            onMoveDay={handleMoveDay}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Log Out */}
                    <div className="mt-auto mb-8 w-full">
                        {user && (
                            <>
                                {/* Settings Section */}
                                <div className="w-full flex flex-col items-center">
                                    <button
                                        onClick={() => {
                                            setSettingsExpanded(true);
                                            setExpandedCollection(null);
                                            setExpandedTrip(null);
                                            setLocations([]);
                                        }}

                                        className="w-full flex flex-col items-center justify-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                                    >
                                        <i className="ri-settings-3-line text-xl mb-1"></i>
                                        <span className="text-xs">Settings</span>
                                    </button>
                                </div>
                            </>
                        )}

                        {user ? (
                            <div className="w-full flex flex-col items-center space-y-4 mb-6">
                                <button
                                    onClick={handleSignOut}
                                    className="flex flex-col items-center justify-center text-gray-700 hover:text-red-500 hover:bg-gray-100 py-2 w-full rounded-md"
                                >
                                    <i className="ri-logout-box-r-line text-xl mb-1" />
                                    <span className="text-xs">Log Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center space-y-2 mb-6">
                                <Link href="/register" legacyBehavior>
                                    <a className="flex flex-col items-center text-gray-600 hover:text-gray-900">
                                        <i className="ri-user-add-line text-xl mb-1" />
                                        <span className="text-xs">Register</span>
                                    </a>
                                </Link>
                                <Link href="/login" legacyBehavior>
                                    <a className="flex flex-col items-center text-gray-600 hover:text-gray-900">
                                        <i className="ri-login-box-line text-xl mb-1" />
                                        <span className="text-xs">Login</span>
                                    </a>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav >

                {user && (
                    <>
                        {/* Settings */}
                        {settingsExpanded && (
                            <div className="absolute top-0 left-20 w-96 h-full bg-white shadow-lg p-4 z-30 overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Settings</h2>
                                    <button
                                        onClick={() => setSettingsExpanded(false)}
                                        className="text-gray-600 hover:text-blue-500 transition"
                                        title="Back to Search"
                                    >
                                        <i className="ri-arrow-go-back-line text-xl" />
                                    </button>
                                </div>

                                {/* Font Size */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                                    <select
                                        onChange={(e) =>
                                            document.documentElement.style.setProperty('--user-font-size', e.target.value)
                                        }
                                        className="w-full border rounded p-2 text-sm"
                                    >
                                        <option value="16px">Normal</option>
                                        <option value="18px">Large</option>
                                        <option value="20px">Extra Large</option>
                                    </select>
                                </div>

                                {/* Focus Ring */}
                                <input
                                    type="checkbox"
                                    id="focusOutline"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            document.documentElement.style.setProperty('--outline-style', '2px solid #2563eb');
                                        } else {
                                            document.documentElement.style.setProperty('--outline-style', 'none');
                                        }
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor="focusOutline" className="text-sm text-gray-700">
                                    Show Keyboard Focus Ring
                                </label>

                                {/* Dyslexia Font */}
                                <input
                                    type="checkbox"
                                    id="dyslexiaFont"
                                    onChange={(e) => {
                                        document.body.classList.toggle('dyslexia-font', e.target.checked);
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor="dyslexiaFont" className="text-sm text-gray-700">
                                    Dyslexia-Friendly Font
                                </label>

                                {/* High Contrast Mode */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="highContrast"
                                        onChange={(e) =>
                                            document.body.classList.toggle('high-contrast', e.target.checked)
                                        }
                                        className="mr-2"
                                    />
                                    <label htmlFor="highContrast" className="text-sm text-gray-700">
                                        Enable High Contrast
                                    </label>
                                </div>
                            </div>
                        )}

                    </>
                )
                }

                {/* Mobile Hamburger Button */}
                {
                    !mobileMenuOpen && (
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden fixed top-4 left-4 z-[1000] bg-white rounded-full p-2 shadow-lg"
                        >
                            <i className="ri-menu-line text-2xl text-gray-700"></i>
                        </button>
                    )
                }

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
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                            >
                                <i className="ri-folder-line text-lg mr-2 text-gray-600"></i>
                                <span className="text-sm">{collection.name}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setSettingsExpanded(true);
                            setExpandedCollection(null);
                            setExpandedTrip(null);
                            setLocations([]);
                        }}
                        className="w-full flex flex-col items-center justify-center text-gray-700 rounded-md hover:bg-gray-100 py-2"
                    >
                        <i className="ri-settings-3-line text-xl mb-1"></i>
                        <span className="text-xs">Settings</span>
                    </button>

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