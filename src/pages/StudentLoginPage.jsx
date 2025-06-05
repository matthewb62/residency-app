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
     navigate("/studentHub");
   };

   return (
     <div
       className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 text-white"
       style={{ backgroundImage: "url('/student_background.png')" }}
     >
       <div className="w-full max-w-sm text-center bg-[#050618cc] p-8 rounded-xl shadow-lg backdrop-blur-sm">
         <h2 className="text-xl font-bold mb-1">[ISE]</h2>
         <h1 className="text-2xl font-bold mb-4">Student Login</h1>

         {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

         <form className="space-y-4" onSubmit={handleLogin}>
           <div className="text-left">
             <label className="block text-sm font-medium mb-1">Email</label>
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
