import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TripItem } from "@/types/TripItem";

interface Props {
    item: TripItem;
}

export function AttractionCard({ item }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.location_id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="p-2 bg-white shadow-md rounded border cursor-move mb-2"
        >
            <h4 className="font-medium">{item.attractions.Name}</h4>
            <p className="text-xs text-gray-500">{item.attractions.Address}</p>
        </div>
    );
}
