"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/authContext";
import { supabase } from "@/app/lib/supabaseClient";
import { useCollections } from '@/hooks/useCollections';
import { Location } from '@/types/location';
import dynamic from "next/dynamic";
import { useMap } from '@/context/MapContext';
import { useCollectionsContext } from "@/context/CollectionsContext";
import { useSwipeable } from 'react-swipeable';

// OpenLayers imports
import "ol/ol.css";
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Zoom from "ol/control/Zoom";
import OlSelect from 'ol/interaction/Select.js';
import { Fill, Stroke, Text } from "ol/style";

const Select = dynamic(() => import("react-select"), { ssr: false });

// Options for filters
const tagOptions = [
    { value: "Abbeys and Monastery", label: "Abbeys and Monastery" },
    { value: "Activity", label: "Activity" },
    { value: "Activity Operator", label: "Activity Operator" },
    { value: "Adventure Park", label: "Adventure Park" },
    { value: "Art Gallery", label: "Art Gallery" },
    { value: "Attraction", label: "Attraction" },
    { value: "Beach", label: "Beach" },
    { value: "Bird Watching", label: "Bird Watching" },
    { value: "Cafe", label: "Cafe" },
    { value: "Churches", label: "Churches" },
    { value: "Cinema", label: "Cinema" },
    { value: "Climbing", label: "Climbing" },
    { value: "Comedy", label: "Comedy" },
    { value: "Craft", label: "Craft" },
    { value: "Cycling", label: "Cycling" },
    { value: "Experience", label: "Experience" },
    { value: "Fine Dining", label: "Fine Dining" },
    { value: "Fishing", label: "Fishing" },
    { value: "Food Shops", label: "Food Shops" },
    { value: "Food and Drink", label: "Food and Drink" },
    { value: "Forest Park", label: "Forest Park" },
    { value: "Gardens", label: "Gardens" },
    { value: "Golf", label: "Golf" },
    { value: "Historic Houses and Castle", label: "Historic Houses and Castle" },
    { value: "Horse Riding", label: "Horse Riding" },
    { value: "Kayaking", label: "Kayaking" },
    { value: "Kitesurfing", label: "Kitesurfing" },
    { value: "Learning", label: "Learning" },
    { value: "Literary Ireland", label: "Literary Ireland" },
    { value: "Local Produce", label: "Local Produce" },
    { value: "Museums", label: "Museums" },
    { value: "Music", label: "Music" },
    { value: "National Park", label: "National Park" },
    { value: "Nature and Wildlife", label: "Nature and Wildlife" },
    { value: "Offshore Island", label: "Offshore Island" },
    { value: "Park and Forest Walk", label: "Park and Forest Walk" },
    { value: "Pubs and Bar", label: "Pubs and Bar" },
    { value: "Restaurant", label: "Restaurant" },
    { value: "Ruins", label: "Ruins" },
    { value: "Sailing", label: "Sailing" },
    { value: "Sculpture", label: "Sculpture" },
    { value: "Seafood", label: "Seafood" },
    { value: "Shopping", label: "Shopping" },
    { value: "Shopping Centres and Department Store", label: "Shopping Centres and Department Store" },
    { value: "Spa and Wellness", label: "Spa and Wellness" },
    { value: "Surfing", label: "Surfing" },
    { value: "Tour", label: "Tour" },
    { value: "Trails", label: "Trails" },
    { value: "Venue", label: "Venue" },
    { value: "Visitor Farm", label: "Visitor Farm" },
    { value: "Walking", label: "Walking" },
    { value: "Windsurfing", label: "Windsurfing" },
    { value: "Zip Lining", label: "Zip Lining" },
];

const countyOptions = [
    { value: "Carlow", label: "Carlow" },
    { value: "Cavan", label: "Cavan" },
    { value: "Clare", label: "Clare" },
    { value: "Cork", label: "Cork" },
    { value: "Donegal", label: "Donegal" },
    { value: "Dublin", label: "Dublin" },
    { value: "Galway", label: "Galway" },
    { value: "Kerry", label: "Kerry" },
    { value: "Kildare", label: "Kildare" },
    { value: "Kilkenny", label: "Kilkenny" },
    { value: "Laois", label: "Laois" },
    { value: "Leitrim", label: "Leitrim" },
    { value: "Limerick", label: "Limerick" },
    { value: "Longford", label: "Longford" },
    { value: "Louth", label: "Louth" },
    { value: "Mayo", label: "Mayo" },
    { value: "Meath", label: "Meath" },
    { value: "Monaghan", label: "Monaghan" },
    { value: "Offaly", label: "Offaly" },
    { value: "Roscommon", label: "Roscommon" },
    { value: "Sligo", label: "Sligo" },
    { value: "Tipperary", label: "Tipperary" },
    { value: "Waterford", label: "Waterford" },
    { value: "Westmeath", label: "Westmeath" },
    { value: "Wexford", label: "Wexford" },
    { value: "Wicklow", label: "Wicklow" },
];

const customStyles = {
    control: (provided: any) => ({
        ...provided,
        padding: "4px",
        borderRadius: "0.375rem",
        borderColor: "#d1d5db",
        boxShadow: "none",
        "&:hover": { borderColor: "#9ca3af" },
    }),
    menu: (provided: any) => ({
        ...provided,
        zIndex: 50,
    }),
};

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<OlMap | null>(null);
    const { user } = useAuth();
    const [selectedFilters, setSelectedFilters] = useState<{ value: string; label: string }[]>([]);
    const [selectedCounties, setSelectedCounties] = useState<{ value: string; label: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null); // track which attraction’s dropdown is open
    const dropdownRef = useRef<HTMLDivElement | null>(null); //handles clicking outside of collection popup    
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isListOpen, setIsListOpen] = useState<boolean>(false);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [selectedGridId, setSelectedGridId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Initially true
    const [isCollectionPopupOpen, setIsCollectionPopupOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature<Point> | null>(null);
    const { createCollection, addToCollection, collections, deleteCollection } = useCollectionsContext();
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const { locations, setLocations, focusOnLocation } = useMap(); // now available here too


    const normalizeLocation = (loc: any) => ({
        id: loc.id,
        name: loc.name ?? loc.Name,
        county: loc.county ?? loc.County,
        address: loc.address ?? loc.Address,
        telephone: loc.telephone ?? loc.Telephone,
        url: loc.url ?? loc.Url,
        tags: loc.tags ?? loc.Tags,
        latitude: loc.latitude ?? loc.Latitude,
        longitude: loc.longitude ?? loc.Longitude,
    });

    // carousel
    const handleSelectLocation = (location: any) => {
        if (!location) {
            setSelectedLocation(null);
            setCurrentIndex(null);
            return;
        }

        const index = locations.findIndex((loc) => loc.id === location.id);
        setCurrentIndex(index);
        setSelectedLocation(normalizeLocation(location));
    };


    const handleNext = () => {
        if (currentIndex === null || locations.length === 0) return;
        const nextIndex = (currentIndex + 1) % locations.length;
        setCurrentIndex(nextIndex);
        setSelectedLocation(normalizeLocation(locations[nextIndex]));
    };

    const handlePrevious = () => {
        if (currentIndex === null || locations.length === 0) return;
        const prevIndex = (currentIndex - 1 + locations.length) % locations.length;
        setCurrentIndex(prevIndex);
        setSelectedLocation(normalizeLocation(locations[prevIndex]));
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrevious,
        delta: 50, // min swipe distance in px
        preventDefaultTouchmoveEvent: true,
        trackTouch: true,
        trackMouse: false,
    });

    const handleScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        // When user reaches bottom, load more data
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
            setLoading(true);
            loadMoreLocations();
        }
    };

    const loadMoreLocations = async () => {
        if (!hasMore) return; // Stop fetching if no more locations

        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                filters: selectedFilters.map(filter => filter.value).join(","),
                counties: selectedCounties.map(county => county.value).join(","),
                offset: locations.length.toString(), // Pagination offset
                limit: "20",
            });

            const response = await fetch(`/api/locations?${queryParams.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch more locations");

            const newData = await response.json();

            if (newData.length === 0) {
                setHasMore(false);
            } else {
                // Filter out duplicates using a Set
                setLocations(prev => {
                    const existingIds = new Set(prev.map(loc => loc.id)); // Track existing IDs
                    const filteredData = newData.filter(loc => !existingIds.has(loc.id)); // Remove duplicates
                    return [...prev, ...filteredData]; // Append only unique items
                });
            }
        } catch (err) {
            console.error("Error loading more locations:", err);
        }
    };


    const toggleDropdown = (id: string) => {
        setDropdownOpenId((prev) => (prev === id ? null : id)); // Close if open, otherwise open
    };

    // Fetch new locations on filter change
    const fetchLocations = async () => {
        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                filters: selectedFilters.map(filter => filter.value).join(","),   // Multiple tags
                counties: selectedCounties.map(county => county.value).join(","), // Multiple counties
            });

            const response = await fetch(`/api/locations?${queryParams.toString()}`);

            if (!response.ok) throw new Error("Failed to fetch locations");

            const data = await response.json();
            setLocations(data); // Update locations on success
        } catch (err) {
            console.error("Error fetching locations:", err);
            setLocations([]); // Clear locations on error
        }
    };

    // !!!!!!!!
    const fetchAllLocations = async () => {
        try {
            const response = await fetch(`/api/locations?${queryParams.toString()}`); // there is a limit here !!!!!!!
            if (!response.ok) throw new Error("Failed to fetch all locations");

            const data = await response.json();
            setLocations(data);
        } catch (err) {
            console.error("Error fetching all locations:", err);
            setLocations([]);
        }
    };

    useEffect(() => {
        if (
            searchQuery ||
            (selectedFilters.length > 0 && !selectedFilters.some(filter => filter.value === "All")) ||
            selectedCounties.length > 0
        ) {
            if (selectedFilters.some(filter => filter.value === "All")) {
                // !!!!!!!
                fetchAllLocations(); // fetch all attractions if "Show all attractions" is selected
            } else {
                fetchLocations(); // fetch filtered locations
            }
        } else {
            setLocations([]); // reset locations if no filters are selected
        }
    }, [searchQuery, selectedFilters, selectedCounties]);

    useEffect(() => {
        if (
            searchQuery ||
            selectedFilters.length > 0 ||
            selectedCounties.length > 0
        ) {
            fetchLocations();
        } else {
            setLocations([]); // Clear locations if no filters are applied
        }
    }, [searchQuery, selectedFilters, selectedCounties]);


    // handles clicking outside and inside the collections popup
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpenId(null); // Close dropdown if clicking outside
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    useEffect(() => {
        if (!map || locations.length === 0) return;

        console.log("Marker render effect triggered");
        console.log("Map is ready:", map);
        console.log("Locations:", locations);

        // Remove previous vector layers
        const existingVectorLayers = map.getLayers().getArray().filter(layer => layer.get("highlight"));
        existingVectorLayers.forEach(layer => map.removeLayer(layer));

        const vectorSource = new VectorSource();
        let selectedFeature: Feature<Point> | null = null;

        locations.forEach((location) => {
            const isSelected = selectedLocation && selectedLocation.id === location.id;

            const feature = new Feature({
                geometry: new Point(fromLonLat([location.longitude, location.latitude])),
                id: location.id,
                name: location.name,
                url: location.url,
                telephone: location.telephone,
                address: location.address,
                tags: location.tags,
                county: location.county,
            });

            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: isSelected ? "marker-icon-red.svg" : "marker-icon-red2.svg",
                        scale: isSelected ? 0.085 : 0.035,
                        anchor: [0.5, 1],
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                    }),
                    text: isSelected
                        ? new Text({
                            text: location.name,
                            offsetY: -20,
                            font: "bold 14px Arial",
                            fill: new Fill({ color: "#000" }),
                            stroke: new Stroke({ color: "#fff", width: 3 }),
                        })
                        : undefined,
                    zIndex: isSelected ? 1000 : 1,
                })
            );

            if (isSelected) {
                selectedFeature = feature;
            }

            vectorSource.addFeature(feature);
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 5,
        });

        vectorLayer.set("highlight", true);
        map.addLayer(vectorLayer);

        if (selectedFeature) {
            const highlightLayer = new VectorLayer({
                source: new VectorSource({ features: [selectedFeature] }),
                zIndex: 1001,
            });
            highlightLayer.set("highlight", true);
            map.addLayer(highlightLayer);
        }

    }, [map, locations]);


    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && hasMore) {
                loadMoreLocations();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore]);


    const handleCreateCollection = async () => {
        const collectionName = prompt('Enter a name for your new collection:');
        if (!collectionName) return;

        await createCollection(collectionName); // Pass the name to the hook
    };

    // Call fetchLocations inside useEffect
    useEffect(() => {
        fetchLocations(); // This is the correct place to call the async function
    }, [searchQuery, selectedFilters, selectedCounties]);

    // Initialize OpenLayers map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const osmLayer = new TileLayer({ source: new OSM() });
        const mapInstance = new OlMap({
            target: mapContainerRef.current,
            layers: [osmLayer],
            view: new View({
                center: fromLonLat([-8.24389, 53.41291]),
                zoom: 7.5,
            }),
        });

        mapInstance.addControl(new Zoom());
        setMap(mapInstance);

        return () => {
            mapInstance.setTarget(null);
        };
    }, []);

    // Update markers on location change
    useEffect(() => {
        if (!map) return;

        // Remove any old vector layers
        const existingVectorLayers = map.getLayers().getArray().filter(layer => layer.get("highlight"));
        existingVectorLayers.forEach(layer => map.removeLayer(layer));

        // Create vector source for markers
        const vectorSource = new VectorSource();
        let selectedFeature: Feature<Point> | null = null; // Keep track of selected marker

        locations.forEach((location) => {
            const isSelected = selectedLocation && selectedLocation.id === location.id;

            const feature = new Feature({
                geometry: new Point(fromLonLat([location.Longitude, location.Latitude])),
                id: location.id,
                name: location.Name,
                url: location.Url,
                telephone: location.Telephone,
                address: location.Address,
                tags: location.Tags,
                county: location.County,
            });

            // Adjust style based on selection
            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: isSelected ? "marker-icon-red.svg" : "marker-icon-red2.svg",
                        scale: isSelected ? 0.085 : 0.035, // Larger selected marker
                        anchor: [0.5, 1],
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                    }),
                    text: isSelected
                        ? new Text({
                            text: location.Name,
                            offsetY: -20,
                            font: "bold 14px Arial",
                            fill: new Fill({ color: "#000" }),
                            stroke: new Stroke({ color: "#fff", width: 3 }),
                        })
                        : undefined, // Label only for selected
                    zIndex: isSelected ? 1000 : 1, // Higher z-index for selected marker
                })
            );

            if (isSelected) {
                selectedFeature = feature; // Store selected feature
            }

            vectorSource.addFeature(feature);
        });

        // Create a new layer for updated markers
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 5, // Lower zIndex for all markers
        });

        vectorLayer.set("highlight", true);
        map.addLayer(vectorLayer);

        // Ensure selected marker is always on top
        if (selectedFeature) {
            const highlightLayer = new VectorLayer({
                source: new VectorSource({ features: [selectedFeature] }),
                zIndex: 1001, // Highest zIndex to be above all
            });
            highlightLayer.set("highlight", true);
            map.addLayer(highlightLayer);
        }

        // Marker selection interaction
        const selectInteraction = new OlSelect();
        map.addInteraction(selectInteraction);

        selectInteraction.on("select", (event) => {
            const feature = event.selected[0];

            if (feature) {
                setSelectedFeature(feature);
                handleSelectLocation(feature.getProperties());
            } else {
                setSelectedFeature(null);
                setSelectedLocation(null);
            }
        });

        return () => {
            map.removeInteraction(selectInteraction);
        };
    }, [map, locations, selectedLocation]); // Re-run when selectedLocation changes

    return (
        <div className="relative h-screen ml-auto z-10">
            {/* Filter section */}
            {/* === Map UI Controls === */}
            <div className="absolute top-4 left-[5rem] right-4 md:left-28 md:w-[20rem] z-50 space-y-4">

                {/* Search Input - Always visible */}
                <div className="bg-white p-3 shadow-lg rounded-full w-full flex items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 rounded-full outline-none text-sm"
                        placeholder="Search for attractions..."
                    />
                </div>

                {/* Filters - Only shown on medium and up */}
                <div className="hidden md:block bg-white p-4 shadow-lg rounded w-full space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag:</label>
                        <Select
                            options={tagOptions}
                            value={selectedFilters}
                            onChange={(selectedOptions) =>
                                setSelectedFilters(selectedOptions as { value: string; label: string }[])
                            }
                            styles={customStyles}
                            isMulti
                            isSearchable
                            placeholder="Select tags..."
                            closeMenuOnSelect={false}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by County:</label>
                        <Select
                            options={countyOptions}
                            value={selectedCounties}
                            onChange={(options) =>
                                setSelectedCounties(options as { value: string; label: string }[])
                            }
                            styles={customStyles}
                            isMulti
                            isSearchable
                            placeholder="Select counties..."
                            closeMenuOnSelect={false}
                        />
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Toggle Button (List Open/Close) */}
            {!selectedLocation && (
                <button
                    className={`absolute ${isListOpen ? "bottom-1/3" : "bottom-6"} left-1/2 transform -translate-x-1/2 bg-white border border-gray-400 w-14 h-14 rounded-full flex items-center justify-center z-[1000]`}
                    onClick={() => setIsListOpen(!isListOpen)}
                >
                    <span className="text-2xl text-gray-600">{isListOpen ? "↓" : "↑"}</span>
                </button>
            )
            }

            {/* === Mobile Popup for Selected Attraction === */}
            {
                selectedLocation && (
                    <div className="fixed bottom-0 left-0 right-0 block md:hidden z-50 bg-white shadow-xl rounded-t-lg border-t border-gray-200 h-64 px-4 pt-4 pb-20">

                        {/* Close button (always top right) */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSelectLocation(null)}
                                className="text-xl text-gray-500 hover:text-gray-800"
                            >
                                <i className="ri-close-line" />
                            </button>
                        </div>

                        {/* Swipable Attraction Info */}
                        <div {...swipeHandlers} className="flex flex-col items-center justify-center text-center h-full mt-[-1rem]">

                            {/* Arrows + Title */}
                            <div className="flex items-center justify-between w-full px-2 mt-2 mb-3">
                                {/* Left arrow */}
                                <button
                                    onClick={handlePrevious}
                                    className="text-2xl text-gray-600 hover:text-gray-900"
                                >
                                    <i className="ri-arrow-left-s-line" />
                                </button>

                                {/* Title */}
                                <div className="flex-1 px-2">
                                    <h2 className="text-lg font-semibold">{selectedLocation.name}</h2>
                                    <p className="text-sm text-gray-600">
                                        <strong>County:</strong> {selectedLocation.county}
                                    </p>
                                    {selectedLocation.tags && (
                                        <p className="text-sm text-gray-600">
                                            <strong>Tags:</strong> {selectedLocation.tags}<br></br>
                                            {selectedLocation.url && (
                                                <a
                                                    href={selectedLocation.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Visit Website
                                                </a>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Right arrow */}
                                <button
                                    onClick={handleNext}
                                    className="text-2xl text-gray-600 hover:text-gray-900"
                                >
                                    <i className="ri-arrow-right-s-line" />
                                </button>
                            </div>
                        </div>

                        {/* Bottom Button Row */}
                        <div className="absolute bottom-4 left-4 right-4 flex gap-4">
                            <button
                                className="w-1/2 bg-gray-200 hover:bg-red-500 text-gray-700 hover:text-white py-2 rounded text-sm"
                                onClick={() => console.log("Favorited:", selectedLocation.name)}
                            >
                                <i className="ri-heart-line mr-1" /> Favorite
                            </button>

                            <button
                                className="w-1/2 bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white py-2 rounded text-sm"
                                onClick={() => setIsCollectionPopupOpen(true)}
                            >
                                <i className="ri-add-line mr-1" /> Add to Collection
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Attraction Sidebar (Popup) */}
            {
                selectedLocation && (
                    <div className="hidden md:block absolute top-4 right-8 h-auto w-1/3 bg-white shadow-md p-2 overflow-y-auto rounded z-40">
                        {/* Header (Title + Buttons) */}
                        <div className="flex items-center justify-between space-x-2">
                            {/* Title Container */}
                            <div className="flex-1 min-w-0">
                                <h2
                                    className="text-xl font-bold truncate"
                                    title={selectedLocation.name} // Tooltip to show full title on hover
                                >
                                    {selectedLocation.name}
                                </h2>
                            </div>

                            {/* Buttons Container */}
                            <div className="flex space-x-4 shrink-0">
                                <button
                                    onClick={() => handleSelectLocation(null)}
                                    className="text-gray-600 hover:text-gray-800 bold h-8 w-8 text-xl"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <p className="text-sm text-gray-600 pt-2"><strong>Address:</strong> {selectedLocation.address}</p>
                        <p className="text-sm text-gray-600"><strong>County:</strong> {selectedLocation.county}</p>

                        {selectedLocation.telephone && (
                            <p className="text-sm text-gray-600"><strong>Phone:</strong> {selectedLocation.telephone}</p>
                        )}

                        {selectedLocation.url && (
                            <p className="text-sm text-gray-600">
                                <strong>Website:</strong>
                                <a href={selectedLocation.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                    {selectedLocation.url}
                                </a>
                            </p>
                        )}

                        {selectedLocation.tags && (
                            <p className="text-sm text-gray-600"><strong>Tags:</strong> {selectedLocation.tags}</p>
                        )}

                        {/* buttons at the bottom */}
                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={() => console.log("Favorited:", selectedLocation.name)}
                                className="flex-1 bg-gray-200 hover:bg-red-500 text-gray-700 hover:text-white py-2 rounded-lg mr-2"
                            >
                                <i className="ri-heart-line text-xl"></i> Favorite
                            </button>

                            <button
                                onClick={() => setIsCollectionPopupOpen(true)}
                                className="flex-1 bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white py-2 rounded-lg"
                            >
                                <i className="ri-add-line text-xl"></i> Add to Collection
                            </button>

                        </div>
                        {/* collection popup (only shows when isCollectionPopupOpen is true) */}
                        {isCollectionPopupOpen && selectedLocation && (
                            <div className=" w-auto mt-4 bg-white p-4 rounded">
                                <div className="flex justify-between">
                                    <h3 className="text-lg font-bold">Add to Collection</h3>
                                    <button onClick={() => setIsCollectionPopupOpen(false)} className="text-gray-600 hover:text-gray-800">
                                        <i className="ri-close-line text-xl"></i>
                                    </button>
                                </div>

                                {/* input for new collection */}
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="New collection name"
                                    className="w-full p-2 border rounded mt-2"
                                />

                                <button
                                    onClick={async () => {
                                        if (newCollectionName.trim()) {
                                            await createCollection(newCollectionName.trim(), selectedLocation);
                                            setNewCollectionName('');
                                            setIsCollectionPopupOpen(false);
                                        } else {
                                            alert('Please enter a collection name.');
                                        }
                                    }}

                                    className="w-full mt-2 bg-green-500 text-white py-1 rounded hover:bg-green-600"
                                >
                                    Create Collection
                                </button>

                                {/* list of existing collections */}
                                {collections.length > 0 ? (
                                    <div className="mt-2">
                                        {collections.map((collection) => (
                                            <button
                                                key={collection.id}
                                                onClick={() => {
                                                    if (!selectedLocation) {
                                                        console.error("Error: selectedLocation is null before adding to collection.");
                                                        return;
                                                    }
                                                    addToCollection(collection.id, selectedLocation);
                                                    setIsCollectionPopupOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 border-b hover:bg-gray-100"
                                            >
                                                {collection.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mt-2">No collections found.</p>
                                )}
                            </div>
                        )}

                    </div>
                )
            }

            {/* Grid Box Bottom */}
            <div
                className={`absolute bottom-0 left-0 w-full bg-white shadow-lg transition-all overflow-hidden ${isListOpen && (!selectedLocation || (typeof window !== 'undefined' && window.innerWidth >= 768))
                    ? 'h-1/3'
                    : 'h-0'
                    }`}
            >
                {/* Check if there are any locations */}
                {locations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                        No attractions filtered
                    </div>
                ) : (
                    <div
                        className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto h-full"
                        ref={scrollRef} // Reference for tracking scroll position
                        onScroll={handleScroll} // Detect scroll
                    >
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className="cursor-pointer p-4 border rounded-lg shadow-md bg-white transition-all duration-300"
                                onClick={() => {
                                    setSelectedLocation(normalizeLocation(location));

                                    setSelectedGridId(location.id);
                                    if (location.Latitude && location.Longitude) {
                                        focusOnLocation(location.Latitude, location.Longitude);
                                    }
                                }}
                            >
                                <h3 className="font-semibold">{location.Name}</h3>
                                <p className="text-sm">{location.County}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid of Attractions */}
                <div
                    className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto h-full"
                    ref={scrollRef} // Reference for tracking scroll position
                    onScroll={handleScroll} // Detect scroll
                >

                    {locations.map((location) => (
                        <div key={location.id ?? location.Name}
                            onClick={() => {
                                setSelectedLocation(normalizeLocation(location));

                                setSelectedGridId(location.id);

                                if (location.Latitude && location.Longitude) {
                                    focusOnLocation(location.Latitude, location.Longitude);
                                }
                            }}

                            className={`cursor-pointer p-4 border rounded-lg shadow-md bg-white transition-all duration-300 ${selectedGridId === location.id ? "border-1 border-blue-600" : "border-gray-300"
                                }`}

                        >
                            <h3 className="font-semibold">{location.Name}</h3>
                            <p className="text-sm">{location.County}</p>
                            <div
                                key={location.id}
                                onClick={() => {
                                    console.log("Clicked location:", location);
                                    setSelectedLocation(normalizeLocation(location));
                                    setSelectedGridId(location.id);
                                }}
                            ></div>

                            {dropdownOpenId === location.id && (
                                <div ref={dropdownRef} className="absolute top-10 right-2 bg-white border rounded shadow-lg z-50 w-56">
                                    <div className="px-4 py-2 border-b">
                                        <input
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            placeholder="New collection name"
                                            className="w-full p-2 border rounded"
                                        />
                                        <button
                                            onClick={() => {
                                                if (newCollectionName.trim()) {
                                                    createCollection(newCollectionName.trim());
                                                    setNewCollectionName('');
                                                    setDropdownOpenId(null);
                                                } else {
                                                    alert('Please enter a collection name.');
                                                }
                                            }}
                                            className="w-full mt-2 bg-primary text-white py-1 rounded hover:bg-green-600"
                                        >
                                            Create Collection
                                        </button>
                                    </div>

                                    {collections.length > 0 ? (
                                        collections.map((collection) => (
                                            <button
                                                key={collection.id}
                                                onClick={() => {
                                                    console.log("Location before insert 2:", location); // collection debug

                                                    addToCollection(collection.id, location);
                                                    setDropdownOpenId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Add to {collection.name}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-2 text-sm text-gray-500">No collections found.</p>
                                    )}
                                </div>
                            )}

                            <p className="text-sm">{location.County}</p>
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
};

export default Map;