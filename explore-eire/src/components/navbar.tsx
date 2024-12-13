"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../app/lib/authContext";
import { supabase } from "../app/lib/supabaseClient";
import logo from "../../public/images/logoedit.png";

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
            className="group fixed top-0 left-0 h-screen bg-background w-16 hover:w-64 transition-all duration-300 ease-in-out shadow-lg flex flex-col items-center"
        >
            {/* Logo */}
            <div className="mt-6 mb-4">
                <Link href="/" legacyBehavior>
                    <button>
                        <Image
                            src={logo}
                            alt="the explore eire logo"
                            width={50}
                            height={50}
                            className="rounded-full"
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

function SidebarItem({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link href={href} legacyBehavior>
            <a
                className="flex items-center space-x-4 text-gray-600 hover:text-gray-900 w-full px-4 py-2 transition-colors duration-300 group"
            >
                <span className="text-2xl">{icon}</span>
                <span className="hidden group-hover:block">{label}</span>
            </a>
        </Link>
    );
}
