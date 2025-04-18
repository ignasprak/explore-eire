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

export const dayBorderColours: Record<number, string> = {
    0: "border-red-500",
    1: "border-orange-500",
    2: "border-yellow-400",
    3: "border-green-500",
    4: "border-blue-500",
    5: "border-indigo-500",
    6: "border-violet-500",
};

export const dayColours: Record<number, string> = {
    0: "border-red-300 bg-[rgba(255,0,0,0.05)]",
    1: "border-orange-300 bg-[rgba(255,165,0,0.05)]",
    2: "border-yellow-300 bg-[rgba(255,255,0,0.05)]",
    3: "border-green-300 bg-[rgba(0,128,0,0.05)]",
    4: "border-blue-300 bg-[rgba(0,0,255,0.05)]",
    5: "border-indigo-300 bg-[rgba(75,0,130,0.05)]",
    6: "border-violet-300 bg-[rgba(238,130,238,0.05)]",
};

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
                <div
                    key={item.location_id}
                    className={`p-3 rounded border shadow-sm ${dayColours[currentDay] ?? "bg-white border-gray-300"
                        }`}
                >
                    <div
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() => onSelect(item)}
                    >
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

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(item);
                            }}
                            className="text-gray-500 hover:text-red-500 transition"
                        >
                            <i className="ri-close-line text-xl" />
                        </button>
                    </div>

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
