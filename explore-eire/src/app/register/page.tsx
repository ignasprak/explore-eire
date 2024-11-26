"use client"

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';
import Image from 'next/image';
import Link from 'next/link';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        console.log('Starting registration process...');

        try {
            // Sign up the user with Supabase Auth
            console.log('Signing up user with Supabase Auth...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username, // Add username to raw_user_meta_data
                    },
                },
            });

            if (authError) {
                console.error('Auth error:', authError);
                throw authError;
            }

            console.log('User signed up successfully:', authData);

            // Insert user data into the "accounts" table
            const user = authData.user;

            if (user) {
                console.log('Inserting user data into the "accounts" table...');
                const { error: dbError } = await supabase.from('accounts').insert([
                    {
                        id: user.id, // UUID from the auth table
                        email: email,
                        password: password, // Store the password if needed (ensure it's hashed)
                        username: username,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ]);

                if (dbError) {
                    console.error('Database error:', dbError);
                    console.error('Database error details:', dbError.message, dbError.details, dbError.hint);
                    throw dbError;
                }

                console.log('User data inserted successfully into the "accounts" table');
                setSuccess('Registration successful!');
                router.push('/login'); // Redirect to login page after successful registration
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during registration:', error.message);
                setError(error.message);
            } else {
                console.error('Unknown error during registration:', error);
                setError('An unknown error occurred');
            }
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
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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

                        <button type="submit" className="bg-highlight text-white p-2 rounded hover:bg-highlight-dark">
                            Register
                        </button>
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