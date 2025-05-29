import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import StudentPage from "./pages/StudentPage";
import StudentQuiz from "./pages/StudentQuiz";
import CompanyPage from "./pages/CompanyPage";


export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/student/quiz" element={<StudentQuiz />} />
        <Route path="/company" element={<CompanyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

