"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/authContext";

// OpenLayers imports
import "ol/ol.css"; // OpenLayers CSS for proper rendering
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

interface Location {
    Name: string;
    id: string;
    Url: string;
    Telephone: string;
    Latitude: number;
    Longitude: number;
    Address: string;
    County: string;
    Tags: string;
}

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    // const popupContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<OlMap | null>(null);
    const { user } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>("All");
    const [selectedCounty, setSelectedCounty] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchLocations = async () => {
        const queryParams = new URLSearchParams({
            search: searchQuery,
            filter: selectedFilter,
            county: selectedCounty,
        });

        try {
            const response = await fetch(`/api/locations?${queryParams.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Error fetching locations:", data.error);
                setLocations([]);
            } else {
                setLocations(data);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setLocations([]);
        }
    };

    // fetch new locations on filter change
    useEffect(() => {
        fetchLocations();
    }, [searchQuery, selectedFilter, selectedCounty]);

    // initialise mapbox map
    useEffect(() => {
        if (!mapContainerRef.current) return;
        // if (!mapContainerRef.current || !popupContainerRef.current) return;

        // Initialize the map
        const osmLayer = new TileLayer({
            source: new OSM(),
        });

        const mapInstance = new OlMap({
            target: mapContainerRef.current,
            layers: [osmLayer],
            view: new View({
                center: fromLonLat([-8.24389, 53.41291]), // Center on Ireland
                zoom: 6.5,
            }),
        });

        // Add the popup overlay
        // const popupOverlay = new Overlay({
        //     id: "popup", // Ensure the ID is set for future reference
        //     element: popupContainerRef.current,
        //     autoPan: true,
        //     autoPanAnimation: { duration: 250 },
        // });

        // mapInstance.addOverlay(popupOverlay);

        setMap(mapInstance);

        return () => {
            mapInstance.setTarget(null);
        };
    }, []);

    // update markers on location change
    useEffect(() => {
        if (!map) return;

        // Remove existing vector layers
        const existingVectorLayers = map.getLayers().getArray().filter((layer) => layer instanceof VectorLayer);
        existingVectorLayers.forEach((layer) => map.removeLayer(layer));

        // Create a vector source and layer for the markers
        const vectorSource = new VectorSource();

        locations.forEach((location) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([location.Longitude, location.Latitude])),
                name: location.Name,
                url: location.Url,
                telephone: location.Telephone,
                address: location.Address,
                tags: location.Tags,
                county: location.County,
            });

            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: "marker-icon-red.svg", // Replace with your custom marker icon path
                        scale: 0.03, // Adjust marker size
                        anchor: [0.5, 1], // Anchor at the bottom center of the image
                        anchorXUnits: "fraction", // X anchor as a fraction of the image width
                        anchorYUnits: "fraction", // Y anchor as a fraction of the image height
                    }),
                })
            );


            vectorSource.addFeature(feature);
        });

        const vectorLayer = new VectorLayer({ source: vectorSource });
        map.addLayer(vectorLayer);
    }, [map, locations]);

    //

    // Add click event for popups
    // const handleMapClick = (event: any) => {
    //     const features = map.getFeaturesAtPixel(event.pixel);
    //     if (features.length > 0) {
    //         const feature = features[0];
    //         const properties = feature.getProperties();

    //         const popupContent = `
    //   <div>
    //     <h2 style="font-size: 16px; margin: 0;"><strong>${properties.name}</strong></h2>
    //     <p style="margin: 5px 0;">County: ${properties.county}</p>
    //     <p style="margin: 5px 0;">Tags: ${properties.tags}</p>
    //     <a href="${properties.url}" target="_blank" style="color: blue;">Visit Website</a>
    //   </div>
    // `;

    //         if (popupContainerRef.current) {
    //             popupContainerRef.current.innerHTML = popupContent;
    //         }

    //         const overlay = map.getOverlayById("popup");
    //         if (overlay) {
    //             const coordinates = feature.getGeometry().getCoordinates();
    //             overlay.setPosition(coordinates);
    //         }
    //     } else {
    //         const overlay = map.getOverlayById("popup");
    //         if (overlay) {
    //             overlay.setPosition(undefined);
    //         }
    //     }
    // };

    // map.on("singleclick", handleMapClick);

    // return () => {
    //     map.un("singleclick", handleMapClick);
    // };
    // }, [map, locations]);

    return (
        // width of the map might need to change!!!
        <div className="relative w-[96.75%] h-screen ml-auto">
            {/* Filter Section */}
            <div className="absolute top-8 right-4 bg-white p-2 rounded shadow-lg z-50">
                <label className="block text-sm font-medium text-gray-700">Search:</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Search by name or address"
                />

                <label className="block text-sm font-medium text-gray-700 mt-2">Filter by Tag:</label>
                <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="All">All</option>
                    <option value="Fishing">Fishing</option>
                    <option value="Hiking">Hiking</option>
                    <option value="Beach">Beach</option>
                    <option value="Food">Food</option>
                </select>

                <label className="block text-sm font-medium text-gray-700 mt-2">Filter by County:</label>
                <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="All">All</option>
                    <option value="Dublin">Dublin</option>
                    <option value="Cork">Cork</option>
                </select>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Popup Container */}
            {/* <div
                ref={popupContainerRef}
                className="ol-popup bg-white p-2 border border-gray-300 rounded shadow-lg"
                style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1000 }}
            /> */}
        </div>
    );
};

export default Map;
