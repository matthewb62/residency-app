import React from "react";
import { useNavigate } from "react-router-dom";

export default function StudentHub() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 text-white"
      style={{ backgroundImage: "url('/student_hub_background.png')" }}
    >
      <div className="w-full max-w-md text-center bg-[#050618cc] p-10 rounded-xl shadow-lg backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-8">🎓 Student Hub</h1>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/jobs")}
            className="w-full bg-[#1dbf73] hover:bg-[#18a861] text-white py-3 rounded-xl text-lg shadow transition"
          >
            💼 Jobs Board
          </button>

          <button
            onClick={() => navigate("/map")}
            className="w-full bg-[#1aa566] hover:bg-[#168d56] text-white py-3 rounded-xl text-lg shadow transition"
          >
            🗺️ Residency Map
          </button>

          <button
            onClick={() => navigate("/quiz")}
            className="w-full bg-[#178a5a] hover:bg-[#13744b] text-white py-3 rounded-xl text-lg shadow transition"
          >
            📊 Residency Quiz
          </button>

          <button
            onClick={() => navigate("/studentPage")}
            className="w-full bg-[#146f4e] hover:bg-[#105a40] text-white py-3 rounded-xl text-lg shadow transition"
          >
            📌 Submit Rankings
          </button>
        </div>
      </div>
    </div>
  );
}