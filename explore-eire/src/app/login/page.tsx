"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("Sign-in error:", error);
                throw new Error(error.message);
            }

            if (!data.user?.email_confirmed_at) {
                setIsEmailConfirmed(false);
                throw new Error("If you have just registered, please remember to confirm your email");
            }

            setIsEmailConfirmed(true);
            setSuccess("Sign-in successful! Redirecting...");
            router.push("/");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">Sign In</h2>
                <form onSubmit={handleSignIn}>
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
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Sign In
                    </button>
                </form>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {!isEmailConfirmed && <p className="text-yellow-500 mt-4">Please confirm your email before signing in.</p>}
                {success && <p className="text-green-500 mt-4">{success}</p>}
                <p className="mt-4 text-gray-600 text-center">
                    Dont have an account?{" "}
                    <a href="/register" className="text-blue-500 hover:underline">
                        Register
                    </a>
                </p>

                <p className="mt-4 text-gray-600 text-center">
                    Go back?{" "}
                    <a href="/" className="text-blue-500 hover:underline">
                        Homepage
                    </a>
                </p>
            </div>
        </div>
    );
}
