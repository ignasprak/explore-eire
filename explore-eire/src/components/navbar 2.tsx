"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../app/lib/authContext";
import { supabase } from "../app/lib/supabaseClient";
import logo1 from "../../public/images/newEElogoWsymbol.png";
import logo2 from "../../public/images/newEElogoWOsymbol.png";
import "../app/globals.css";
import { useState } from "react";

export default function Sidebar() {
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const [isBackgroundVisible, setIsBackgroundVisible] = useState(false);

    // Function to handle sign out
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    const handleSidebarHover = () => {
        setIsHovered(true);
        setIsBackgroundVisible(true); // Fade in background immediately
    };

    const handleSidebarLeave = () => {
        setIsHovered(false); // Shrink sidebar immediately
        setTimeout(() => setIsBackgroundVisible(false), 200); // Delay fade-out
    };


    return (
        <>
            {/* Background Overlay (Now Independent from Sidebar Hover) */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300 ease-in-out ${isBackgroundVisible ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            {/* Sidebar */}
            <nav
                className={`group fixed top-0 left-0 h-screen bg-background w-16 md:hover:w-[300px] transition-all duration-300 ease-in-out shadow-lg flex flex-col items-center z-50`}
                onMouseEnter={handleSidebarHover}
                onMouseLeave={handleSidebarLeave}
            >
                {/* Logo */}
                <div className="m-0 mt-2 relative">
                    <Link href="/" legacyBehavior>
                        <button>
                            <Image
                                src={logo2}
                                alt="Explore Eire Logo - Default"
                                width={50}
                                height={50}
                                className="block group-hover:hidden"
                            />
                            <Image
                                src={logo1}
                                alt="Explore Eire Logo - Hover"
                                width={200}
                                height={80}
                                className="hidden group-hover:block m-0"
                            />
                        </button>
                    </Link>
                </div>

                {/* Links */}
                <div className="flex flex-col space-y-4 mt-8 w-full">
                    {user && (
                        <SidebarItem
                            href={`/collections/${user.id}`}
                            label="Collections"
                            icon="📚"
                        />
                    )}
                    <SidebarItem href="#" label="Attractions" icon="🌄" />
                    <SidebarItem href="#" label="Groups" icon="👥" />
                    <SidebarItem href="#" label="Settings" icon="⚙️" />
                </div>

                {/* User Menu */}
                <div className="mt-auto mb-8 w-full">
                    {user ? (
                        <>
                            <div className="text-center text-gray-500 group-hover:block hidden">
                                Welcome, {user.email}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-red-500 hover:underline py-2 text-center"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Link href="/register" legacyBehavior>
                                <a className="text-gray-600 hover:text-gray-900 py-2">Register</a>
                            </Link>
                            <Link href="/login" legacyBehavior>
                                <a className="text-gray-600 hover:text-gray-900 py-2">Login</a>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}

// SidebarItem Component
function SidebarItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} legacyBehavior>
            <a className="flex items-center space-x-4 text-gray-600 hover:text-gray-900 w-full px-4 py-2 transition-colors duration-300 group">
                <i className={`ri-${icon}-line text-2xl`}></i>
                <span className="hidden group-hover:block">{label}</span>
            </a>
        </Link>
    );
}
