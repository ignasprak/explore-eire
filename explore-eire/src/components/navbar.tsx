"use client"

import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/images/logoedit.png';
import { useAuth } from '../app/lib/authContext';
import { supabase } from '../app/lib/supabaseClient';

// navbar component
export default function Navbar() {
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
        <nav className="flex filter drop-shadow-md bg-background px-4 py-4 h-28 items-center relative">
            {/* logo */}
            <div className="w-3/12 flex items-center">
                <Link href="/" legacyBehavior>
                    <button>
                        <Image
                            src={logo}
                            alt="the explore eire logo"
                            width={100}
                            height={100}
                            className="m-0 max-w-36"
                        />
                    </button>
                </Link>
            </div>

            {/* links */}
            <div className="w-6/12 flex justify-center items-center space-x-8">
                {user && (
                    <Link href={`/collections/${user.id}`} legacyBehavior>
                        <a className="text-gray-600 transform hover:scale-150 transition-transform duration-150">
                            collections
                        </a>
                    </Link>
                )}

                <Link href="/completed-attractions" legacyBehavior>
                    <a className="text-gray-600 transform hover:scale-150 transition-transform duration-150">attractions</a>
                </Link>
                <Link href="/groups" legacyBehavior>
                    <a className="text-gray-600 transform hover:scale-150 transition-transform duration-150">groups</a>
                </Link>
                <Link href="/account-settings" legacyBehavior>
                    <a className="text-gray-600 transform hover:scale-150 transition-transform duration-150">settings</a>
                </Link>
            </div>

            {/* user menu */}
            <div className="w-3/12 flex justify-end items-center">
                {user ? (
                    <>
                        <span className="mx-4">welcome, {user.email}</span>
                        <button onClick={handleSignOut} className="mx-4 text-red-500 hover:underline">
                            sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/register" legacyBehavior>
                            <a className="mx-4">register</a>
                        </Link>
                        <Link href="/login" legacyBehavior>
                            <a className="mx-4">login</a>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
