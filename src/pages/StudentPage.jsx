import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function StudentPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('Block 1.4 EPIC') // replace with actual table name
        .select('*');

      if (error) console.error("Error fetching companies:", error);
      else setCompanies(data);
    };

    fetchCompanies();
  }, []);

  return (
    <div>
      <h2>Available Companies</h2>
      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <ul>
          {companies.map((c) => (
            <li key={c.company_id || c.id}>{c.company_name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}



