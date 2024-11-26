"use client"

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/navbar';
import Link from 'next/link';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            setSuccess('Registration successful!');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="bg-primary font-sans min-h-screen flex flex-col">
            {/* NavBar Section */}
            <Navbar />

            <div className="bg-tertiary rounded-lg p-6 min-h-96vh w-11/12 mx-auto mb-4 mt-4 flex justify-center items-center flex-grow">
                <div className="w-1/4 p-8">
                    <h1 className="text-6xl mb-4">Register</h1>
                    <form onSubmit={handleRegister}>

                        <div className="mb-4">
                            <label className="block mb-2">Username:</label>
                            <input
                                type="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

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

                        <div className="mb-4">
                            <label className="block mb-2">Repeat your password:</label>
                            <input
                                type="repeat_password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>

                        <button type="submit" className="bg-highlight text-white p-2 rounded hover:*:">Register</button>
                    </form>

                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {success && <p className="text-green-500 mt-4">{success}</p>}
                </div>

                <div className="w-1/2 flex flex-col items-center justify-center">
                    <Image
                        src="/images/reg.jpg"
                        alt="Irish Stone Building"
                        width={400}
                        height={400}
                        className="rounded-lg m-8"
                    />
                    <Link href="/login" className="m-4 text-dark hover:underline">
                        I am already a user
                    </Link>
                </div>
            </div>
        </div>
    );
}