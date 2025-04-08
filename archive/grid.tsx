{/* Floating Toggle Button (List Open/Close) */ }
{
    !selectedLocation && (
        <button
            className={`absolute ${isListOpen ? "bottom-1/3" : "bottom-6"} left-1/2 transform -translate-x-1/2 bg-white border border-gray-400 w-14 h-14 rounded-full flex items-center justify-center z-[1000]`}
            onClick={() => setIsListOpen(!isListOpen)}
        >
            <span className="text-2xl text-gray-600">{isListOpen ? "↓" : "↑"}</span>
        </button>
    )
}

{/* Grid Box Bottom????????? */ }
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