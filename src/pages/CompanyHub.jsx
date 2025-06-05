import React from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyHub() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 text-white"
      style={{ backgroundImage: "url('/comphub_bg.png')" }}
    >
      <div className="w-full max-w-md text-center bg-[#050618cc] p-10 rounded-xl shadow-lg backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-8">🏢 Company Hub</h1>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/student-board")}
            className="w-full bg-[#1e2a4e] hover:bg-[#2c3b67] text-white py-3 rounded-xl text-lg shadow transition"
          >
            📋 Student Board
          </button>

          <button
            onClick={() => navigate("/companyPage")}
            className="w-full bg-[#152040] hover:bg-[#1f2b55] text-white py-3 rounded-xl text-lg shadow transition"
          >
            🧮 Student Ranking
          </button>
        </div>
      </div>
    </div>
  );
}
