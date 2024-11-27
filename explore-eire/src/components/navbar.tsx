"use client"

import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/images/logoedit.png';
import { useAuth } from '../app/lib/authContext';
import { supabase } from '../app/lib/supabaseClient';

export default function Navbar() {
    const { user } = useAuth();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        } else {
            // Clear user-related data from local storage or any other client-side storage
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(); // Reload the page to reset the state
        }
    };

    return (
        <nav className="flex filter drop-shadow-md bg-background px-4 py-4 h-28 items-center">
            {/* the explore eire logo */}
            <div className="w-3/12 flex items-center">
                <Link href="/">
                    <button>
                        <Image src={logo} alt="The Explore Eire Logo" layout="fixed" className='m-0 max-w-36' />
                    </button>
                </Link>
            </div>

            {/* AI search bar */}
            <div className="w-6/12 flex justify-center items-center">
                <p className="text-xl font-semibold mr-4 ">
                    <a className="underline decoration-pink-500 text-left">AI</a> <a className="underline decoration-indigo-500">SEARCH</a>
                </p>
                <input
                    type="text"
                    placeholder="Search... FEATURE YET TO BE IMPLEMENTED"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
            </div>
            {/* menu buttons for user customisation */}
            <div className="w-3/12 flex justify-end items-center">
                {user ? (
                    <>
                        <span className="mx-4">Welcome, {user.email}</span>
                        <button onClick={handleSignOut} className="mx-4 text-red-500 hover:underline">
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/register" className="mx-4">
                            Register
                        </Link>
                        <Link href="/login" className="mx-4">
                            Login
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}