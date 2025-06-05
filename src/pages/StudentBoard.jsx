import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StudentBoard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentsForCompany() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        setLoading(false);
        return;
      }

      const { data: company, error: companyError } = await supabase
        .from("company_data")
        .select("company_id")
        .eq("auth_id", user.id)
        .single();

      if (companyError || !company) {
        console.error("Company lookup failed:", companyError);
        setLoading(false);
        return;
      }

      const { data: cvs, error: cvsError } = await supabase
        .from("cvs")
        .select("cv_url, student_account(id, student_name, student_email)")
        .eq("company_id", company.company_id);

      if (cvsError) {
        console.error("CV fetch failed:", cvsError);
        setLoading(false);
        return;
      }

      setStudents(cvs);
      setLoading(false);
    }

    fetchStudentsForCompany();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/jobs_board_bg.png')" }}>
        <p className="text-white text-lg">Loading students...</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/jobs_board_bg.png')" }}
    >
      <h1 className="text-4xl font-bold mb-10 text-center text-white">
        📋 Students Who Submitted CVs
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {students.length === 0 ? (
          <p className="text-center col-span-full text-white">
            No CVs submitted yet.
          </p>
        ) : (
          students.map((entry, idx) => (
            <div
              key={idx}
              className="bg-[#f5f5f5cc] p-6 rounded-2xl shadow-xl hover:shadow-2xl transition backdrop-blur-sm border border-blue-300"
            >
              <h2 className="text-xl font-bold text-blue-800 mb-2">
                {entry.student_account?.student_name || "Unnamed Student"}
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                {entry.student_account?.student_email || "No email provided"}
              </p>
              <a
                href={entry.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                View CV
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
