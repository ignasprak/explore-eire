"use client";

import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableItem from "./DraggableItem";

interface Props {
    days: number[];
    items: { location_id: string; day: number }[];
    onDragEnd: (event: DragEndEvent) => void;
}

export default function DragAndDropList({ days, items, onDragEnd }: Props) {
    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto">
                {days.map((day) => {
                    const dayItems = items.filter((i) => i.day === day);

                    return (
                        <div key={day} id={day.toString()} className="min-w-[280px] flex-shrink-0">
                            <div className="p-4 bg-gray-100 border rounded">
                                <h3 className="text-md font-semibold mb-2">Day {day}</h3>

                                <SortableContext
                                    items={dayItems.map((i) => i.location_id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2 min-h-[100px]">
                                        {dayItems.length > 0 ? (
                                            dayItems.map((item) => (
                                                <DraggableItem key={item.location_id} item={item} />
                                            ))
                                        ) : (
                                            <p className="italic text-gray-400">Drag a destination here</p>
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        </div>
                    );
                })}
            </div>
        </DndContext>
    );
}
