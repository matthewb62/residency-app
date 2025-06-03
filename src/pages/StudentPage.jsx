import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StudentPage() {
  const [companies, setCompanies] = useState([]);
  const [quizOptions, setQuizOptions] = useState(null); // ✅ moved inside the component

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('Block 1.4 EPIC') // ✅ make sure this matches your Supabase table
        .select('*');

      if (error) console.error("Error fetching companies:", error);
      else setCompanies(data);
    };

    fetchCompanies();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Companies</h2>
      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <ul className="list-disc pl-6">
          {companies.map((c) => (
            <li key={c.company_id || c.id}>{c.company_name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}


