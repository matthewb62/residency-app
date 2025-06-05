import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0B0C2A] to-[#1DB96E] text-gray-100 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
        Welcome to the Residency System
      </h1>

      <button
        onClick={() => navigate("/student-login")}
        className="bg-[#1DB96E] hover:bg-[#1aa860] text-white px-8 py-4 rounded-xl shadow-lg text-xl flex items-center gap-2 transition"
      >
        🎓 Student Hub
      </button>

      <button
        onClick={() => navigate("/company-login")}
        className="bg-[#135847] hover:bg-[#0f4739] text-white px-8 py-4 rounded-xl shadow-lg text-xl flex items-center gap-2 transition"
      >
        🏢 Company Hub
      </button>

      <button
        onClick={() => navigate("/admin")}
        className="bg-[#0B0C2A] hover:bg-[#050618] text-white px-8 py-4 rounded-xl shadow-lg text-xl flex items-center gap-2 transition"
      >
        🛠️ Admin Hub
      </button>
    </div>
  );
}
