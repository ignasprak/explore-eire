"use client";
import { useEffect, useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { supabase } from "@/app/lib/supabaseClient";

interface TripItem {
    location_id: string;
    day: number;
    position: number;
    attractions: {
        Name: string;
        Address: string;
    };
}

export default function TripPlanner({ tripId }: { tripId: string }) {
    const [items, setItems] = useState<TripItem[]>([]);
    const [days, setDays] = useState<number[]>([1]);

    useEffect(() => {
        const fetchTrip = async () => {
            const { data } = await supabase
                .from("user_trips")
                .select("location_id, day, position, attractions ( Name, Address )")
                .eq("trip_id", tripId);

            if (!data) return;

            setItems(data);
            const uniqueDays = [...new Set(data.map((i) => i.day))];
            setDays([...uniqueDays, Math.max(...uniqueDays) + 1]);
        };

        fetchTrip();
    }, [tripId]);

    const handleDrop = async (draggedItem: any, newDay: number) => {
        const updated = items.map((item) => {
            if (item.location_id === draggedItem.id) {
                return { ...item, day: newDay };
            }
            return item;
        });

        setItems(updated);

        await supabase
            .from("user_trips")
            .update({ day: newDay })
            .match({ trip_id: tripId, location_id: draggedItem.id });

        // Ensure a blank day exists at the end
        if (!updated.some((i) => i.day === newDay + 1)) {
            setDays((prev) => [...prev, newDay + 1]);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {days.map((day) => (
                    <div key={day}>
                        <h2 className="font-semibold mb-2">Day {day}</h2>
                        <DropZone
                            day={day}
                            items={items.filter((i) => i.day === day)}
                            onDrop={handleDrop}
                        />
                    </div>
                ))}
            </div>
        </DndProvider>
    );
}
