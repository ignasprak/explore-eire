"use client";

import React from "react";

interface TripAttractionListProps {
    items: any[];
    currentDay: number;
    allDays: number[];
    setItems: (items: any[]) => void;
    onSelect: (item: any) => void;
    onRemove: (item: any) => void;
    onMoveDay: (item: any, newDay: number) => void;
}


export function TripAttractionList({
    items,
    setItems,
    onSelect,
    onRemove,
    onMoveDay,
    currentDay,
    allDays,
}: TripAttractionListProps) {
    return (
        <div className="flex flex-col space-y-2 overflow-y-auto max-h-[75%] pr-1">
            {items.map((item) => (
                <div key={item.location_id} className="p-3 border rounded bg-gray-100">
                    <div className="flex justify-between items-start">
                        <div onClick={() => onSelect(item)} className="cursor-pointer">
                            <h4 className="font-semibold">{item.attractions?.Name}</h4>
                            <p className="text-sm">{item.attractions?.Address}</p>
                            {item.attractions?.Url && (
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
                        <button
                            onClick={() => onRemove(item)}
                            className="text-gray-500 hover:text-red-500 transition"
                        >
                            <i className="ri-close-line text-xl"></i>
                        </button>
                    </div>

                    {/* Move to Day Buttons */}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {allDays
                            .filter((day) => day !== currentDay)
                            .map((day) => (
                                <button
                                    key={day}
                                    onClick={() => onMoveDay(item, day)}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                    Move to Day {day + 1}
                                </button>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
