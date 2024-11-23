"use client"

import { useState } from "react";
import WeatherSection from "./foryou/weathersection";
import NearbySection from "./foryou/nearbysection";
import PopularSection from "./foryou/popularsection";
import ForYouSection from "./foryou/foryousection";
import HiddenGemsSection from "./foryou/hiddengemssection";

export default function ForYou() {
    const [selectedOption, setSelectedOption] = useState("For You");

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
        <div className="bg-white p-6 w-11/12 h-[56.5rem] rounded-lg mx-auto">
            <div className="flex items-center justify-between mb-4 bg-gray-200 rounded-lg p-5">
                <button className="text-gray-600 ml-5" onClick={() => handleOptionClick("Weather")}>Weather</button>
                <button className="text-gray-600 ml-5" onClick={() => handleOptionClick("Nearby")}>Nearby</button>
                <button className="text-gray-600 mr-5" onClick={() => handleOptionClick("Popular")}>Popular</button>
                <button className="text-gray-600 mr-5" onClick={() => handleOptionClick("For You")}>For You</button>
                <button className="text-gray-600 mr-5" onClick={() => handleOptionClick("Hidden Gems")}>Hidden Gems</button>
            </div>
            <div className="flex flex-col border-blue-700 h-96">
                {renderContent()}
            </div>
        </div>
    );
}