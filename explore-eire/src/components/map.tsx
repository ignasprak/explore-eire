"use client";

// application imports 
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/authContext";
import dynamic from "next/dynamic";
import { useMap } from '@/context/MapContext';
import { useCollectionsContext } from "@/context/CollectionsContext";
import { useSwipeable } from 'react-swipeable';
import { useSelectedAttraction } from "@/context/SelectedAttractionContext";
import { useTripsContext } from "@/context/TripsContext";

// ol imports
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

// pretty drop down selection boxes (and search)
const Select = dynamic(() => import("react-select"), { ssr: false });

// all the options for tags based on the values in the database from failte.ie dataset
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

// couties in Ireland
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

// custom styles
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
    const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null); // for tracking which attractions dropdown is openn
    const dropdownRef = useRef<HTMLDivElement | null>(null); //handles clicking outside of collection poup
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isListOpen, setIsListOpen] = useState<boolean>(false);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isCollectionPopupOpen, setIsCollectionPopupOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature<Point> | null>(null);
    const { createCollection, addToCollection, collections, deleteCollection } = useCollectionsContext();
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const { locations, setLocations, focusOnLocation } = useMap();
    const { trips, addToTrip } = useTripsContext();
    const [isTripPopupOpen, setIsTripPopupOpen] = useState(false);

    const cleanLocData = (loc: any) => ({
        id: loc.id,
        name: loc.name ?? loc.Name,
        county: loc.county ?? loc.County,
        address: loc.address ?? loc.Address,
        telephone: loc.telephone ?? loc.Telephone,
        url: loc.url ?? loc.Url,
        tags: loc.tags ?? loc.Tags,
        latitude: loc.latitude ?? loc.Latitude,
        longitude: loc.longitude ?? loc.Longitude,
        markerIcon: loc.markerIcon ?? "map-marker-red2.svg",
    });

    // carousel for mobile view
    const handleSelectLocation = (location: any) => {
        if (!location) {
            setSelectedLocation(null);
            setCurrentIndex(null);
            return;
        }
        const index = locations.findIndex((loc) => loc.id === location.id);
        setCurrentIndex(index);
        setSelectedLocation(cleanLocData(location));
    };


    const handleNext = () => {
        if (currentIndex === null || locations.length === 0) return;
        const nextIndex = (currentIndex + 1) % locations.length;
        setCurrentIndex(nextIndex);
        setSelectedLocation(cleanLocData(locations[nextIndex]));
    };

    const handlePrevious = () => {
        if (currentIndex === null || locations.length === 0) return;
        const prevIndex = (currentIndex - 1 + locations.length) % locations.length;
        setCurrentIndex(prevIndex);
        setSelectedLocation(cleanLocData(locations[prevIndex]));
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleNext,
        onSwipedRight: handlePrevious,
        delta: 50,
        trackTouch: true,
        trackMouse: false,
    });

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
            setLoading(true);
            loadMoreLocations();
        }
    };

    const loadMoreLocations = async () => {
        if (!hasMore) return;
        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                filters: selectedFilters.map(filter => filter.value).join(","),
                counties: selectedCounties.map(county => county.value).join(","),
                offset: locations.length.toString(),
                limit: "20",
            });
            const response = await fetch(`/api/locations?${queryParams.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch more locations");
            const newData = await response.json();
            if (newData.length === 0) {
                setHasMore(false);
            } else {
                const existingIds = new Set(locations.map(loc => loc.id));
                const filteredData = newData.filter(loc => !existingIds.has(loc.id));
                const normalisedData = filteredData.map((loc: any) => cleanLocData(loc));
                setLocations([...locations, ...normalisedData]);
            }
        } catch (err) {
            console.error("Error loading more locations:", err);
        }
    };
    const toggleDropdown = (id: string) => {
        setDropdownOpenId((prev) => (prev === id ? null : id));
    };

    // fetch locations when the filters change
    const fetchLocations = async () => {
        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                filters: selectedFilters.map(filter => filter.value).join(","),
                counties: selectedCounties.map(county => county.value).join(","),
            });
            const response = await fetch(`/api/locations?${queryParams.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch locations");
            const data = await response.json();
            const dataWithMarkers = data.map((loc: any) => cleanLocData(loc));
            setLocations(dataWithMarkers);
        } catch (err) {
            console.error("Error fetching locations:", err);
            setLocations([]);
        }
    };

    // !!!!maybe consider redoing this or gettinf rid of it, since I am doing show all attractions
    const getAllMarkers = async () => {
        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                filters: selectedFilters.map(filter => filter.value).join(","),
                counties: selectedCounties.map(county => county.value).join(","),
            });
            const response = await fetch(`/api/locations?${queryParams.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch all locations");
            const data = await response.json();
            const normalisedData = data.map((loc: any) => cleanLocData(loc));
            setLocations(normalisedData);
        } catch (err) {
            console.error("Error fetching all locations:", err);
            setLocations([]);
        }
    };

    // takes care of clicking inside and outside of attractions popup
    useEffect(() => {
        if (
            searchQuery ||
            (selectedFilters.length > 0 && !selectedFilters.some(filter => filter.value === "All")) ||
            selectedCounties.length > 0
        ) {
            if (selectedFilters.some(filter => filter.value === "All")) {
                getAllMarkers();
            } else {
                fetchLocations();
            }
        } else {
            setLocations([]);
        }
    }, [searchQuery, selectedFilters, selectedCounties]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    useEffect(() => {
        if (!map || locations.length === 0) return;

        // marker and map testing
        console.log("1. Markesr are being rendered now!!!");
        console.log("2. Map is ready and initialised: ", map);
        console.log("3. Locations have loaded in: ", locations);

        // take away previous vector layers
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
            // would be nice to eventually add in marker clustering for accessibility purposes
            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: location.markerIcon
                            ? `/images/markers/${location.markerIcon}`
                            : `/images/markers/map-marker-red2.svg`,
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

        await createCollection(collectionName); // pass name to the hook
    };

    // calls fetchLocations() inside when filters are set
    useEffect(() => {
        fetchLocations();
    }, [searchQuery, selectedFilters, selectedCounties]);

    // initialise the openlayers map
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

    // update the markers when there is a location change
    useEffect(() => {
        if (!map) return;

        // take away previous vector layers (copied from above, maybe make a function for it???)
        const existingVectorLayers = map.getLayers().getArray().filter(layer => layer.get("highlight"));
        existingVectorLayers.forEach(layer => map.removeLayer(layer));

        // create vector source for markers
        const vectorSource = new VectorSource();
        let selectedFeature: Feature<Point> | null = null; // keep track of selected marker

        locations.forEach((location) => {
            const isSelected = selectedLocation && selectedLocation.id === location.id;

            // testing purposes for markers, not showing up on filter change
            console.log("Marker icon for location2:", location.name, "->", location.markerIcon);

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

            // adjust style based on selection
            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: location.markerIcon
                            ? `/images/markers/${location.markerIcon}`
                            : `/images/markers/map-marker-red2.svg`,
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
                        : undefined, // only for selcted
                    zIndex: isSelected ? 1000 : 1, // make higher z for visibility sake
                })
            );

            if (isSelected) {
                selectedFeature = feature; // store selected feature
            }

            vectorSource.addFeature(feature);
        });

        // create a new later for updated amrkers
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 5, // lower z index for everhy marker
        });

        vectorLayer.set("highlight", true);
        map.addLayer(vectorLayer);

        // ensure selcetd marker is alwaus on top
        if (selectedFeature) {
            const highlightLayer = new VectorLayer({
                source: new VectorSource({ features: [selectedFeature] }),
                zIndex: 1001, // very big z index
            });
            highlightLayer.set("highlight", true);
            map.addLayer(highlightLayer);
        }

        // marker selection interaction
        const selectInteraction = new OlSelect();
        map.addInteraction(selectInteraction);

        selectInteraction.on("select", (event) => {
            const feature = event.selected[0];

            if (feature && feature.getGeometry() instanceof Point) {
                setSelectedFeature(feature as Feature<Point>);
                handleSelectLocation(feature.getProperties());
            } else {
                setSelectedFeature(null);
                setSelectedLocation(null);
            }
        });
        return () => {
            map.removeInteraction(selectInteraction);
        };
    }, [map, locations, selectedLocation]); // redo when selectedLcoation changes

    return (
        <div className="relative h-screen ml-auto z-10">
            {/* Filter section */}
            {/* Map UI Controls */}
            <div className="absolute top-4 left-[5rem] right-4 md:left-28 md:w-[20rem] z-50 space-y-4">
                {/* Search Input */}
                <div className="bg-white p-3 shadow-lg rounded-full w-full flex items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 rounded-full outline-none text-sm"
                        placeholder="Search for attractions..."
                    />
                </div>
                {/* Filters, only on medium and up */}
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
            {/* Mobile Popup for Selected Attraction (do I even continue with this, design needs more thought)*/}
            {
                selectedLocation && (
                    <div className="fixed bottom-0 left-0 right-0 block md:hidden z-50 bg-white shadow-xl rounded-t-lg border-t border-gray-200 h-64 px-4 pt-4 pb-20">
                        {/* Close button (always at the top right) */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleSelectLocation(null)}
                                className="text-xl text-gray-500 hover:text-gray-800"
                            >
                                <i className="ri-close-line" />
                            </button>
                        </div>
                        {/* Swipable Attraction Info Carousel Thing*/}
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

                            {/* Bottom Button Row */}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex gap-4">
                            <button
                                className="w-full bg-gray-200 hover:bg-blue-500 text-gray-700 hover:text-white py-2 rounded text-sm"
                                onClick={() => setIsCollectionPopupOpen(true)}
                            >
                                <i className="ri-add-line mr-1" /> Add to Collection
                            </button>
                            <button
                                onClick={() => {
                                    setIsTripPopupOpen(!isTripPopupOpen);
                                    setIsCollectionPopupOpen(false);
                                }}
                                className="w-full mt-2 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font‑medium py-2 rounded"
                            >
                                <i className="ri-compass-3-line" />
                                Add to Trip
                            </button>
                            {isTripPopupOpen && (
                                <div className="absolute bottom-16 right-4 w-56 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-[999]">
                                    {trips.length === 0 && (
                                        <p className="px-4 py-2 text-sm text-gray-500">No trips yet…</p>
                                    )}
                                    {trips.map((trip) => (
                                        <button
                                            key={trip.id}
                                            onClick={() => {
                                                if (selectedLocation) {
                                                    addToTrip(trip.id, selectedLocation);
                                                    setIsTripPopupOpen(false);
                                                }
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                        >
                                            {trip.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {isCollectionPopupOpen && selectedLocation && (
                                <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
                                    <div className="w-full bg-white rounded-t-lg p-4 max-h-[65vh] overflow-y-auto">
                                        <h3 className="text-lg font-semibold mb-3">Save to collection</h3>
                                        {collections.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={async () => {
                                                    await addToCollection(c.id, selectedLocation);
                                                    setIsCollectionPopupOpen(false);
                                                }}
                                                className="w-full text-left py-2 px-3 rounded hover:bg-gray-100"
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                        <form
                                            onSubmit={async (e) => {
                                                e.preventDefault();
                                                const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value.trim();
                                                if (!name) return;
                                                await createCollection(name, selectedLocation);
                                                setIsCollectionPopupOpen(false);
                                            }}
                                            className="mt-4 flex gap-2"
                                        >
                                            <input
                                                name="name"
                                                placeholder="New collection…"
                                                className="flex‑1 border rounded px-2 py-1 text-sm"
                                            />
                                            <button className="bg-primary text-white px-3 rounded">Create</button>
                                        </form>
                                        <button
                                            onClick={() => setIsCollectionPopupOpen(false)}
                                            className="absolute top-2 right-4 text-2xl text-gray-400"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            {/* Attraction Sidebar (Popup) */}

            {

                selectedLocation && (
                    <div className="hidden md:block absolute top-4 right-8 h-auto w-1/3 bg-white shadow-md p-2 overflow-y-auto rounded z-40">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex-1 min-w-0">
                                <h2
                                    className="text-xl font-bold truncate"
                                    title={selectedLocation.name} //   show full title on hover
                                >
                                    {selectedLocation.name}
                                </h2>
                            </div>

                            {/* Buttons container */}

                            <div className="flex space-x-4 shrink-0">
                                <button
                                    onClick={() => handleSelectLocation(null)}
                                    className="text-gray-600 hover:text-gray-800 bold h-8 w-8 text-xl"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>
                        </div>

                        {/* attraction details */}
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
                        {/* buttons bottom */}
                        <div className="mt-4 flex justify-between">
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
                                        const name = newCollectionName.trim();
                                        if (!name) {
                                            alert('Please enter a collection name.');
                                            return;
                                        }
                                        if (!selectedLocation) {
                                            alert('No attraction selected to add to the collection.');
                                            return;
                                        }
                                        await createCollection(name, selectedLocation);
                                        setNewCollectionName('');
                                        setIsCollectionPopupOpen(false);
                                    }}
                                    className="w-full mt-2 bg-primary text-white text-lg py-1 rounded hover:bg-green-600"
                                >
                                    Create a Collection
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
        </div >
    );
};

export default Map;
