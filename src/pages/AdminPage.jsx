// ISEAdminPage.jsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://skavheoivhbrtddpvkog.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZoZW9pdmhicnRkZHB2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjQwOTMsImV4cCI6MjA2NDEwMDA5M30.M9mPXBsmtxXKfHwcCPbbFSIWPFv0R3aAO0L4EQCi77g"
);

export default function ISEAdminPage() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            const { data, error } = await supabase
                .from("matches")
                .select(`
            student_email,
            company_id,
            student_account (name),
            company_data (company_name)
          `);

            if (error) {
                console.error("Error fetching matches:", error);
                return;
            }

            setMatches(data);
        };
        fetchMatches();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">ISE Admin: Final Matches</h1>
            {matches.length === 0 ? (
                <p>No matches found yet.</p>
            ) : (
                <table className="min-w-full table-auto border">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Student Name</th>
                        <th className="px-4 py-2 border">Company</th>
                    </tr>
                    </thead>
                    <tbody>
                    {matches.map((match) => (
                        <tr key={`${match.student_email}-${match.company_id}`}>
                            <td>{match.student_account?.name}</td>
                            <td>{match.company_data?.company_name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}