"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../app/lib/authContext";
import { supabase } from "../app/lib/supabaseClient";
import logo1 from "../../public/images/newEElogoWsymbol.png";
import logo2 from "../../public/images/newEElogoWOsymbol.png";
import "../app/globals.css";

// Sidebar Component
export default function Sidebar() {
    const { user } = useAuth();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("error signing out:", error.message);
        } else {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    return (
        <nav
            className="group fixed top-0 left-0 h-screen bg-background w-20 hover:w-64 transition-all duration-300 ease-in-out shadow-lg flex flex-col items-center z-50"
        >
            {/* Logo NEED TO GET A BETTER PICTURE WHEN SCALED UP MORE*/}
            <div className="h-20 flex items-center justify-center w-full relative">
                <Link href="/" legacyBehavior>
                    <a
                        className="
        w-60 h-32 p-0
        flex items-center justify-center 
        transition-colors duration-200
      "
                        aria-label="Go to homepage"
                    >
                        <Image
                            src={logo2}
                            alt="Explore Eire Logo"
                            width={50}
                            height={50}
                            className="
          transition-transform duration-300 ease-in-out
          group-hover:scale-150
        "
                        />
                    </a>
                </Link>
            </div>


            {/* Links */}
            <div className="flex flex-col mt-10 w-full space-y-3">
                <SidebarItem href="/" label="Homepage" icon="ri-home-line"></SidebarItem>
                {user && (
                    <SidebarItem
                        href={`/collections/${user.id}`}
                        label="My Collections"
                        icon="ri-list-check"
                    />
                )}
                <SidebarItem href="/settings" label="Settings" icon="ri-settings-3-line" />
            </div>


            {/* Login/Registration */}
            <div className="mt-auto mb-8 w-full">
                {user ? (
                    <>
                        <div className="hidden group-hover:block text-center text-gray-500 mb-2">
                            Welcome, {user.email}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full text-red-500 hover:underline py-2 text-center"
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center space-y-2">
                        <Link href="/register" legacyBehavior>
                            <a className="text-gray-600 hover:text-gray-900">Register</a>
                        </Link>
                        <Link href="/login" legacyBehavior>
                            <a className="text-gray-600 hover:text-gray-900">Login</a>
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
            <a
                className="
            flex items-center justify-start 
            w-full px-4 py-3 
            text-gray-600 hover:text-gray-900 
            transition-all duration-300 ease-in-out
          "
            >
                <i className={`${icon} text-2xl`}></i>
                <span
                    className="
              ml-4 
              opacity-0 
              group-hover:opacity-100 
              group-hover:delay-200 
              transition-opacity duration-200 
              whitespace-nowrap
            "
                >
                    {label}
                </span>
            </a>
        </Link>
    );
}


