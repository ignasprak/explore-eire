// "use client"

// import { useEffect, useRef, useState } from 'react';
// import { useAuth } from '@/app/lib/authContext';
// import { supabase } from '@/app/lib/supabaseClient';

// interface Location {
//     Name: string;
//     id: string;
//     Url: string;
//     Telephone: string;
//     Latitude: number;
//     Longitude: number;
//     Address: string;
//     County: string;
//     Tags: string;
// }

// const Map = ({ locations }: { locations: Location[] }) => {
//     const mapContainerRef = useRef<HTMLDivElement | null>(null);
//     const [selectedFilter, setSelectedFilter] = useState<string>('All');
//     const [selectedCounty, setSelectedCounty] = useState<string>('All');
//     const [selectedCollection, setSelectedCollection] = useState<string>('');
//     const [collectionMessage, setCollectionMessage] = useState<string | null>(null);
//     const [addToCollectionMessage, setAddToCollectionMessage] = useState<string | null>(null);

//     interface Collection {
//         id: string;
//         name: string;
//         user_id: string;
//     }

//     const [collections, setCollections] = useState<Collection[]>([]);
//     const { user } = useAuth();

//     // Fetch collections for the signed-in user
//     useEffect(() => {
//         const fetchCollections = async () => {
//             if (user) {
//                 const { data, error } = await supabase
//                     .from('collections')
//                     .select('*')
//                     .eq('user_id', user.id);

//                 if (error) {
//                     console.error('Error fetching collections:', error.message);
//                 } else {
//                     setCollections(data);
//                 }
//             }
//         };

//         fetchCollections();
//     }, [user]);

//     // Update markers when locations, filter, or county changes
//     useEffect(() => {
//         if (map) {
//             // Remove existing markers
//             markers.forEach((marker) => marker.remove());

//             // Add new markers based on the selected filter and county
//             const newMarkers = locations
//                 .filter(
//                     (location) =>
//                         (selectedFilter === 'All' || location.Tags.includes(selectedFilter)) &&
//                         (selectedCounty === 'All' || location.County === selectedCounty)
//                 )
//                 .map((location) => {
//                                 .setHTML(`
//                                     <h2 style="font-size: 26px;"><strong>${location.Name}</strong></h2> <br>
//                                     <p><strong>County:</strong> ${location.County}</p> <br>
//                                     <p><strong>Tags:</strong> ${location.Tags.split(',').map(tag => `
//                                         <span style="display: inline-block; margin-right: 10px; padding: 2px 5px; background-color: #e0e0e0; border-radius: 3px;">
//                                             ${tag.trim()}
//                                         </span>`).join(' ')}</p> <br>
//                                     <a href="${location.Url}" target="_blank" style="font-size: 18px; color: blue;">Visit Website</a> <br> <br>
//                                     <button style="background-color: #83b271; padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer;">
//                                         Mark as Completed
//                                     </button>
//                                     ${user ? `
//                                         <button id="add-to-collection-${location.id}" 
//                                             style="background-color: #83b271; padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer;">
//                                             Add to ${selectedCollection ? collections.find(c => c.id === selectedCollection)?.name : 'Collection'}
//                                         </button>` : ''}
//                                 `)
//                 .on('open', () => {


//                     if (user) {
//                         const addToCollectionButton = popup.querySelector(`#add-to-collection-${location.id}`);
//                         if (addToCollectionButton) {
//                             addToCollectionButton.addEventListener('click', async () => {
//                                 if (!selectedCollection) {
//                                     alert('Please select a collection first.');
//                                     return;
//                                 }
//                                 try {
//                                     await handleAddToCollection(location.id);
//                                     alert(`"${location.Name}" added to your collection.`);
//                                 } catch (error) {
//                                     console.error('Error adding to collection:', error);
//                                     alert('Failed to add to the collection. Please try again.');
//                                 }
//                             });
//                         }
//                     }
//                 }
//                 })
//                         )
//         .addTo(map);

// return marker;
// });

// setMarkers(newMarkers);
//         }
//     }, [locations, selectedFilter, selectedCounty, map, user, selectedCollection]);

// useEffect(() => {
//     if (collectionMessage) {
//         const timer = setTimeout(() => setCollectionMessage(null), 3000);
//         return () => clearTimeout(timer);
//     }
// }, [collectionMessage]);

// useEffect(() => {
//     if (addToCollectionMessage) {
//         const timer = setTimeout(() => setAddToCollectionMessage(null), 3000);
//         return () => clearTimeout(timer);
//     }
// }, [addToCollectionMessage]);


// const handleAddToCollection = async (locationId: string) => {
//     const location = locations.find((loc) => loc.id === locationId);

//     if (!location) {
//         console.error('Location not found');
//         setAddToCollectionMessage('Failed to add location. Location not found.');
//         return;
//     }

//     try {
//         const { data, error } = await supabase
//             .from('user_collections')
//             .insert({
//                 collection_id: selectedCollection,
//                 location_id: locationId,
//                 metadata: {
//                     name: location.Name,
//                     address: location.Address,
//                     latitude: location.Latitude,
//                     longitude: location.Longitude,
//                     tags: location.Tags,
//                 },
//             });

//         if (error) {
//             console.error('Supabase insert error:', error);
//             setAddToCollectionMessage('Failed to add location to collection. Please try again.');
//             throw new Error(error.message || 'Unknown Supabase error');
//         }

//         console.log('Item successfully added to collection:', data);
//         setAddToCollectionMessage(`Successfully added "${location.Name}" to the collection.`);
//     } catch (error) {
//         console.error('Error adding to collection:', error.message || error);
//         setAddToCollectionMessage('Failed to add location to collection. Please try again.');
//         throw error;
//     }
// };


// return (
//     <div className="flex">
//         {/* Filter Section */}
//         <div className="w-1/6 p-4 mr-2">
//             <h2 className="mb-4">Filter by Tag:</h2>
//             <select id="tag-filter" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border rounded">
//                 <option value="All">All</option>
//                 <option value="Activity">Activity</option>
//                 <option value="Beach">Beach</option>
//                 <option value="Castle">Castle</option>
//                 <option value="Experience">Experience</option>
//                 <option value="Fishing">Fishing</option>
//                 <option value="Food">Food</option>
//                 <option value="Golf">Golf</option>
//                 <option value="Historic">Historic</option>
//                 <option value="Learning">Learning</option>
//                 <option value="Nature">Nature</option>
//                 <option value="Tour">Tour</option>
//                 <option value="Venue">Venue</option>
//                 <option value="Walking">Walking</option>
//             </select>

//             <h2 className="mt-4 mb-4">Filter by County:</h2>
//             <select id="county-filter" value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} className="w-full p-2 border rounded">
//                 <option value="All">All</option>
//                 <option value="Carlow">Carlow</option>
//                 <option value="Cavan">Cavan</option>
//                 <option value="Clare">Clare</option>
//                 <option value="Cork">Cork</option>
//                 <option value="Donegal">Donegal</option>
//                 <option value="Dublin">Dublin</option>
//                 <option value="Galway">Galway</option>
//                 <option value="Kerry">Kerry</option>
//                 <option value="Kildare">Kildare</option>
//                 <option value="Kilkenny">Kilkenny</option>
//                 <option value="Laois">Laois</option>
//                 <option value="Leitrim">Leitrim</option>
//                 <option value="Limerick">Limerick</option>
//                 <option value="Longford">Longford</option>
//                 <option value="Louth">Louth</option>
//                 <option value="Mayo">Mayo</option>
//                 <option value="Meath">Meath</option>
//                 <option value="Monaghan">Monaghan</option>
//                 <option value="Offaly">Offaly</option>
//                 <option value="Roscommon">Roscommon</option>
//                 <option value="Sligo">Sligo</option>
//                 <option value="Tipperary">Tipperary</option>
//                 <option value="Waterford">Waterford</option>
//                 <option value="Westmeath">Westmeath</option>
//                 <option value="Wexford">Wexford</option>
//                 <option value="Wicklow">Wicklow</option>
//             </select>

//             {/* create a collection submission process */}
//             <h2 className='mt-4 mb-4'> Create a Collection:</h2>
//             <form
//                 onSubmit={async (e) => {
//                     e.preventDefault();
//                     const formData = new FormData(e.currentTarget);
//                     const collectionName = formData.get('collectionName') as string;

//                     if (user && collectionName) {
//                         try {
//                             const { data, error } = await supabase
//                                 .from('collections')
//                                 .insert([{ name: collectionName, user_id: user.id }])
//                                 .select('*'); // Fetch the created collection data

//                             if (error) {
//                                 console.error('Error creating collection:', error.message);
//                                 setCollectionMessage('Failed to create collection. Please try again.');
//                                 return;
//                             }

//                             if (data && data.length > 0) {
//                                 const newCollection = data[0];
//                                 setCollections((prevCollections) => [...prevCollections, newCollection]);
//                                 setSelectedCollection(newCollection.id); // Automatically select the new collection
//                                 setCollectionMessage(`Successfully created collection: "${collectionName}".`);
//                             }
//                         } catch (error) {
//                             console.error('Unexpected error:', error);
//                             setCollectionMessage('Failed to create collection. Please try again.');
//                         }
//                     }
//                 }}
//             >

//                 <input
//                     type="text"
//                     name="collectionName"
//                     placeholder="Collection Name"
//                     className="w-full p-2 border rounded mb-2"
//                     required
//                 />
//                 <button type="submit" className="w-full p-2 bg-primary text-white rounded">
//                     Create
//                 </button>
//             </form>




//             {collectionMessage && (
//                 <p className="text-green-600 mt-2">{collectionMessage}</p>
//             )}



//             <h2 className="mt-4 mb-4">Select a Collection:</h2>
//             <select
//                 id="collection-select"
//                 value={selectedCollection}
//                 onChange={(e) => setSelectedCollection(e.target.value)}
//                 className="w-full p-2 border rounded"
//             >
//                 <option value=""></option>
//                 {collections.map((collection) => (
//                     <option key={collection.id} value={collection.id}>
//                         {collection.name}
//                     </option>
//                 ))}
//             </select>
//             {addToCollectionMessage && (
//                 <p className="text-green-600 mt-2">{addToCollectionMessage}</p>
//             )}
//         </div>

//         {/* Map Container */}
//         <div ref={mapContainerRef} className="map-container w-full h-[56.5rem]" />
//     </div>
// );
// };

// export default Map;"use client";"use client";

"use client"
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/authContext";
import { supabase } from "@/app/lib/supabaseClient";
import "ol/ol.css";
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import Overlay from "ol/Overlay";

interface Location {
    id: string;
    Name: string;
    Url: string;
    Telephone: string;
    Latitude: number;
    Longitude: number;
    Address: string;
    County: string;
    Tags: string;
}

interface Collection {
    id: string;
    name: string;
    user_id: string;
}

const Map = ({ locations }: { locations: Location[] }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const popupContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<OlMap | null>(null);
    const [vectorSource] = useState(new VectorSource()); // ✅ Store vector source
    const [selectedFilter, setSelectedFilter] = useState<string>("All");
    const [selectedCounty, setSelectedCounty] = useState<string>("All");
    const [selectedCollection, setSelectedCollection] = useState<string>("");
    const [collections, setCollections] = useState<Collection[]>([]);
    const { user } = useAuth();

    // ✅ Fetch collections when user is available
    useEffect(() => {
        const fetchCollections = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from("collections")
                    .select("*")
                    .eq("user_id", user.id);
                if (error) console.error("Error fetching collections:", error.message);
                else setCollections(data);
            }
        };
        fetchCollections();
    }, [user]);

    // ✅ Initialize OpenLayers Map (only once)
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const osmLayer = new TileLayer({ source: new OSM() });
        const vectorLayer = new VectorLayer({ source: vectorSource }); // ✅ Create vector layer once

        const mapInstance = new OlMap({
            target: mapContainerRef.current,
            layers: [osmLayer, vectorLayer], // ✅ Add vector layer here
            view: new View({
                center: fromLonLat([-8.24389, 53.41291]), // Centered on Ireland
                zoom: 6.5,
            }),
        });

        setMap(mapInstance);

        return () => {
            mapInstance.setTarget(null);
        };
    }, []);

    // ✅ Update markers when locations change
    useEffect(() => {
        if (!map) return;

        vectorSource.clear(); // ✅ Remove old markers

        locations
            .filter(
                (loc) =>
                    (selectedFilter === "All" || loc.Tags.includes(selectedFilter)) &&
                    (selectedCounty === "All" || loc.County === selectedCounty)
            )
            .forEach((location) => {
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

                feature.setStyle(
                    new Style({
                        image: new Icon({
                            src: "/marker-icon-red.svg", // ✅ Ensure this file exists in /public
                            scale: 0.05,
                            anchor: [0.5, 1],
                        }),
                    })
                );

                vectorSource.addFeature(feature);
            });
    }, [map, locations, selectedFilter, selectedCounty]);

    // ✅ Handle popup interactions
    useEffect(() => {
        if (!map || !popupContainerRef.current) return;

        const popupOverlay = new Overlay({
            element: popupContainerRef.current,
            autoPan: true,
            autoPanAnimation: { duration: 250 },
        });

        map.addOverlay(popupOverlay);

        const handleMapClick = (event: any) => {
            const features = map.getFeaturesAtPixel(event.pixel);
            if (features.length > 0) {
                const feature = features[0];
                const properties = feature.getProperties();

                popupContainerRef.current.innerHTML = `
                    <div class="p-3 bg-white shadow-lg border rounded-md">
                        <h2 class="text-lg font-bold">${properties.name}</h2>
                        <p><strong>County:</strong> ${properties.county}</p>
                        <p><strong>Tags:</strong> ${properties.tags}</p>
                        <a href="${properties.url}" target="_blank" class="text-blue-500 underline">Visit Website</a>
                        ${user ? `
                            <button class="bg-green-500 text-white px-3 py-1 mt-2 rounded" id="add-to-collection">
                                Add to Collection
                            </button>
                        ` : ""}
                    </div>
                `;

                popupOverlay.setPosition(feature.getGeometry().getCoordinates());

                if (user) {
                    setTimeout(() => {
                        const addButton = document.getElementById("add-to-collection");
                        if (addButton) {
                            addButton.addEventListener("click", () => handleAddToCollection(properties.id));
                        }
                    }, 100);
                }
            } else {
                popupOverlay.setPosition(undefined);
            }
        };

        map.on("singleclick", handleMapClick);

        return () => map.un("singleclick", handleMapClick);
    }, [map, user]);

    // ✅ Function to add attraction to a collection
    const handleAddToCollection = async (locationId: string) => {
        if (!selectedCollection) {
            alert("Please select a collection first.");
            return;
        }

        try {
            const { error } = await supabase
                .from("user_collections")
                .insert({ collection_id: selectedCollection, location_id: locationId });

            if (error) throw error;

            alert("Attraction added to collection successfully!");
        } catch (error) {
            console.error("Error adding to collection:", error.message);
            alert("Failed to add to collection.");
        }
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-1/4 p-4 bg-gray-100">
                <h2 className="text-lg font-semibold mb-2">Filters</h2>

                <label className="block">Filter by Tag:</label>
                <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border rounded">
                    <option value="All">All</option>
                    <option value="Activity">Activity</option>
                    <option value="Beach">Beach</option>
                </select>

                <label className="block mt-3">Filter by County:</label>
                <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} className="w-full p-2 border rounded">
                    <option value="All">All</option>
                    <option value="Dublin">Dublin</option>
                    <option value="Cork">Cork</option>
                </select>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-screen relative" />
            <div ref={popupContainerRef} className="absolute bg-white p-3 border rounded shadow-lg hidden" />
        </div>
    );
};

export default Map;
