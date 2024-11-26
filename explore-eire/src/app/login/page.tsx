"use client"

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../components/navbar';
import Image from 'next/image';
import Link from 'next/link';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            console.log("Attempting to log in...");
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error("Login error:", authError);
                throw authError;
            }

            console.log("Login successful");
            setSuccess("Login successful! Redirecting...");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unknown error occurred.");
            }
        }
    };

    return (
        <div className="bg-primary font-sans min-h-auto flex flex-col">
            {/* NavBar Section */}
            <Navbar />

            <div className="bg-tertiary rounded-lg p-6 min-h-96vh w-11/12 mx-auto mb-4 mt-4 flex justify-center items-center flex-grow">
                <div className="w-1/4 p-8">
                    <h1 className="text-6xl mb-4">Login</h1>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block mb-2">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-highlight text-white p-2 rounded hover:bg-highlight-dark w-full text-center"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-4">
                        <Link
                            href="/register"
                            className="bg-highlight text-white p-2 rounded hover:bg-highlight-dark w-full text-center block"
                        >
                            Need to Register?
                        </Link>
                    </div>

                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {success && <p className="text-green-500 mt-4">{success}</p>}
                </div>

                <div className="w-1/4 flex flex-col items-left justify-left">
                    <Image
                        src="/images/login.jpg"
                        alt="Irish Stone Building"
                        width={400}
                        height={400}
                        className="rounded-lg m-8"
                    />
                </div>
            </div>
        </div>
    );
}
