"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from '../../components/navbar';

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                    },
                },
            });

            if (authError) {
                throw new Error(authError.message);
            }

            if (authData?.user?.email_confirmed_at === null) {
                setSuccess("Please confirm your account using the link sent to your email.");
                return;
            }

            setSuccess("Registration successful! Redirecting...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-primary">
                <div className="bg-white p-8 rounded shadow-md w-96"></div>
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded hover:bg-green-600"
                    >
                        Register
                    </button>
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {success && <p className="text-green-500 mt-4">{success}</p>}
                <p className="mt-4 text-gray-600 text-center">
                    Already have an account?{" "} <br></br>
                    <a href="/login" className="text-blue-500 hover:underline">
                        Sign In
                    </a>
                </p>

                <p className="mt-4 text-gray-600 text-center"></p>
                Go back?{" "} <br></br>
                <a href="/" className="text-blue-500 hover:underline">
                    Homepage
                </a>
            </div>
        </div>
    );
}
