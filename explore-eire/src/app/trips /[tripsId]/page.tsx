import TripPlanner from "@/components/TripPlanner";

export default function TripView({ params }: { params: { tripId: string } }) {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Trip Planner</h1>
            <TripPlanner tripId={params.tripId} />
        </div>
    );
}
