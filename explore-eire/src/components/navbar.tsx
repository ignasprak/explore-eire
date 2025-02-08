"use client";

// Indicates that this file is a client-side component

import Link from "next/link"; // Importing Link component from Next.js for navigation
import Image from "next/image"; // Importing Image component from Next.js for optimized images
import { useAuth } from "../app/lib/authContext"; // Importing custom hook to get authentication context
import { supabase } from "../app/lib/supabaseClient"; // Importing Supabase client for authentication
import logo1 from "../../public/images/newEElogoWsymbol.png"; // Importing logo image
import logo2 from "../../public/images/newEElogoWOsymbol.png"; // Importing logo image
import "../app/globals.css";

// Sidebar Component
export default function Sidebar() {
    const { user } = useAuth(); // Getting the current user from authentication context

    // Function to handle sign out
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut(); // Signing out the user using Supabase
        if (error) {
            console.error("error signing out:", error.message); // Logging error if sign out fails
        } else {
            localStorage.clear(); // Clearing local storage
            sessionStorage.clear(); // Clearing session storage
            window.location.reload(); // Reloading the page
        }
    };

    return (
        <nav
            className="group fixed top-0 left-0 h-screen bg-background w-16 md:hover:w-[300px] transition-all duration-300 ease-in-out shadow-lg flex flex-col items-center"
        >
            {/* Logo */}
            <div className="m-0 mt-2 relative">
                <Link href="/" legacyBehavior>
                    <button>
                        {/* Default logo: visible when not hovered */}
                        <Image
                            src={logo2}
                            alt="Explore Eire Logo - Default"
                            width={50}
                            height={50}
                            className="block group-hover:hidden "
                        />
                        {/* Hover logo: visible when sidebar is hovered */}
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
    );
}

// SidebarItem Component
function SidebarItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} legacyBehavior>
            <a className="flex items-center space-x-4 text-gray-600 hover:text-gray-900 w-full px-4 py-2 transition-colors duration-300 group">
                {/* Using Remix Icon with the icon prop */}
                <i className={`ri-${icon}-line text-2xl`}></i>
                <span className="hidden group-hover:block">{label}</span>
            </a>
        </Link>
    );
}

