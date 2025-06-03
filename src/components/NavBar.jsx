import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <nav className="bg-gray-800 text-white p-4 flex gap-6">
            <Link to="/" className="hover:underline">🏠 Home</Link>
            <Link to="/student-login" className="hover:underline">🎓 Student</Link>
            <Link to="/company-login" className="hover:underline">🏢 Company</Link>
            <Link to="/student/quiz" className="hover:underline">🧠 Quiz</Link>
            <Link to="/map" className="hover:underline">🗺️ Map</Link>
            <Link to="/admin"> 🕵️ Admin</Link>
        </nav>
    );
}
