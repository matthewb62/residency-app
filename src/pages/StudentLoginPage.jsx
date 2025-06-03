import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function StudentLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous error

        const { data, error: fetchError } = await supabase
            .from("student_account")
            .select("*")
            .eq("student_email", email)
            .single();

        if (fetchError || !data) {
            setError("Email not found.");
            return;
        }

        if (data.password !== password) {
            setError("Incorrect password.");
            return;
        }

        // ✅ Save session and redirect
        localStorage.setItem("student_email", email);
        navigate("/student");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-sm text-center">
                <h2 className="text-xl font-bold mb-1">[ISE]</h2>
                <h1 className="text-2xl font-bold mb-4">Student Login</h1>

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>

                    <div className="text-left">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
