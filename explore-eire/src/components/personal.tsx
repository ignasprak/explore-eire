"use client"

import { useState } from "react";
import WeatherSection from "./personal/weathersection";
import NearbySection from "./personal/nearbysection";
import PopularSection from "./personal/popularsection";
import ForYouSection from "./personal/foryousection";
import HiddenGemsSection from "./personal/hiddengemssection";

export default function ForYou() {
    const [selectedOption, setSelectedOption] = useState("Popular");

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
    };

    const renderContent = () => {
        switch (selectedOption) {
            case "Weather":
                return <WeatherSection />;
            case "Nearby":
                return <NearbySection />;
            case "Popular":
                return <PopularSection />;
            case "For You":
                return <ForYouSection />;
            case "Hidden Gems":
                return <HiddenGemsSection />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 w-11/12 rounded-lg mx-auto h-auto inline-block mb-4">
            {/* options to choose what section the user wants */}
            <div className="flex items-center justify-between mb-4 bg-gray-200 rounded-lg p-5">
                <button className="text-gray-600 ml-10" onClick={() => handleOptionClick("Weather")}>Weather</button>
                <button className="text-gray-600 ml-5" onClick={() => handleOptionClick("Nearby")}>Nearby</button>
                <button className="text-gray-600 mr-5" onClick={() => handleOptionClick("Popular")}>Popular</button>
                <button className="text-gray-600 mr-5" onClick={() => handleOptionClick("For You")}>For You</button>
                <button className="text-gray-600 mr-10" onClick={() => handleOptionClick("Hidden Gems")}>Hidden Gems</button>
            </div>

            {/* rendered content displaying results */}
            <div className="flex flex-col border-blue-700 h-auto">
                {renderContent()}
            </div>

            {/* page selection */}
            <div className="flex justify-center mt-6 rounded-lg">
                {Array.from({ length: 9 }, (_, i) => (
                    <button
                        key={i + 1}
                        className="w-16 h-16 bg-gray-300 text-gray-700 rounded-lg mx-1 flex items-center justify-center transform hover:scale-105 transition-transform duration-200"
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

        </div>
    );
}