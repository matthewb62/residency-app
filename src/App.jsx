import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import StudentPage from "./pages/StudentPage";
import Quiz from "./pages/Quiz";
import CompanyPage from "./pages/CompanyPage";
import AdminPage from "./pages/AdmindPage";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/student/quiz" element={<Quiz />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
