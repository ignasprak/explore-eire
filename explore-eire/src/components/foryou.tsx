import Image from "next/image";

export default function ForYou() {
    return (
        <div className="bg-white p-6 w-11/12 rounded-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
                <button className="text-gray-600">Weather</button>
                <h2 className="text-lg font-bold text-black">POPULAR</h2>
                <button className="text-gray-600">For You</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <div className="w-full h-24 bg-gray-200 mb-2 flex justify-center items-center">
                            <span>LOCATION IMAGE</span>
                        </div>
                        <span className="text-center">Sample Text</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
