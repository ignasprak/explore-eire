"use client";

interface TripAttractionItemProps {
    item: any;
    index: number;
    onSelect: () => void;
    onRemove: () => void;
    onMoveDay: (newDay: number) => void;
    currentDay: number;
    allDays: number[];
}

export function TripAttractionItem({
    item,
    onSelect,
    onRemove,
    onMoveDay,
    currentDay,
    allDays,
}: TripAttractionItemProps) {
    return (
        <div className="p-3 border rounded bg-gray-100 flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div onClick={onSelect} className="cursor-pointer">
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
                <button onClick={onRemove} className="text-gray-500 hover:text-red-500 transition">
                    <i className="ri-close-line text-xl"></i>
                </button>
            </div>
            <div className="text-sm text-gray-600">
                Move to:
                <select
                    className="ml-2 p-1 border text-sm"
                    value={currentDay}
                    onChange={(e) => onMoveDay(Number(e.target.value))}
                >
                    {allDays.map((day) => (
                        <option key={day} value={day}>
                            Day {day}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
