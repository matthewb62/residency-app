import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error: fetchError } = await supabase
      .from("admin_account")
      .select("*")
      .eq("admin_email", email)
      .single();

    if (fetchError || !data) {
      setError("Admin email not found.");
      return;
    }

    if (data.admin_password !== password) {
      setError("Incorrect password.");
      return;
    }

    localStorage.setItem("admin_email", email);
    navigate("/adminpage");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 text-white"
      style={{ backgroundImage: "url('/admin_background.png')" }}
    >
      <div className="w-full max-w-sm text-center bg-[#050618cc] p-8 rounded-xl shadow-lg backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-1">[ISE]</h2>
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="text-left">
            <label className="block text-sm font-medium mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-black"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              className="w-full border border-gray-400 rounded px-3 py-2 bg-white text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0d542b] hover:bg-[#12814d] text-white py-2 rounded shadow-md transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
