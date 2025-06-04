import React from "react";
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import StudentPage from "./pages/StudentPage";
import Quiz from "./pages/Quiz";
import MapView from "./pages/MapView";
import StudentLoginPage from "./pages/StudentLoginPage";
import CompanyLoginPage from "./pages/CompanyLoginPage";
import CompanyPage from "./pages/CompanyPage"
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import JobsBoard from "./pages/JobsBoard";

export default function App() {
    return (
        <BrowserRouter>
            <NavBar /> {/* Always visible */}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/student" element={<StudentPage />} />
                <Route path="/student-login" element={<StudentLoginPage />} />
                <Route path="/company-login" element={<CompanyLoginPage />} />
                <Route path="/student/quiz" element={<Quiz />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/company" element={<CompanyPage />} />
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route path="/adminpage" element={<AdminPage />} />
                <Route path="/jobs" element={<JobsBoard />} /> {/* 👈 NEW route */}
            </Routes>
        </BrowserRouter>
    );
}
