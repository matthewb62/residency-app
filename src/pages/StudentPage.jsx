import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const supabase = createClient(
  "https://skavheoivhbrtddpvkog.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZoZW9pdmhicnRkZHB2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjQwOTMsImV4cCI6MjA2NDEwMDA5M30.M9mPXBsmtxXKfHwcCPbbFSIWPFv0R3aAO0L4EQCi77g"
);

const studentEmail = localStorage.getItem("student_email");

export default function StudentRanking() {
  const [companies, setCompanies] = useState([]);
  const [blocked, setBlocked] = useState(new Set());

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from("company_data")
        .select("company_id, company_name");

      if (error) {
        console.error("Error fetching companies:", error);
        return;
      }

      const formatted = data.map((row) => ({
        id: row.company_id.toString(),
        company_id: row.company_id.toString(),
        name: row.company_name,
      }));

      setCompanies(formatted);
    };

    fetchCompanies();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(companies);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setCompanies(updated);
  };

  const toggleBlock = (id) => {
    const updated = new Set(blocked);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setBlocked(updated);
  };

  const handleSubmit = async () => {
    if (!studentEmail) return alert("Email required");

    const ranked = [];
    let rank = 1;

    companies.forEach((company) => {
      if (blocked.has(company.company_id)) {
        ranked.push({
          student_email: studentEmail,
          company_id: company.company_id,
          rank: 9999,
          ranked_by: "student",
        });
      } else {
        ranked.push({
          student_email: studentEmail,
          company_id: company.company_id,
          rank: rank++,
          ranked_by: "student",
        });
      }
    });

    await supabase
      .from("rankings")
      .delete()
      .eq("student_email", studentEmail)
      .eq("ranked_by", "student");

    const { error: insertError } = await supabase
      .from("rankings")
      .insert(ranked);

    if (insertError) {
      console.error(insertError);
      return alert("Error saving rankings to Supabase");
    }

    alert("Submitted successfully!");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-8"
      style={{ backgroundImage: "url('/sboard_bg.png')" }}
    >
      <div className="w-full max-w-2xl bg-[#101828cc] backdrop-blur p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          📋 Rank Companies
        </h1>

        {companies.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="companies">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] divide-y divide-gray-300"
                >
                  {companies.map((company, index) => (
                    <Draggable
                      key={company.company_id}
                      draggableId={company.company_id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex justify-between items-center px-4 py-3 bg-white bg-opacity-80 rounded-md my-2"
                        >
                          <span className="font-medium text-gray-900">
                            {company.name}
                          </span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={blocked.has(company.company_id)}
                              onChange={() => toggleBlock(company.company_id)}
                            />
                            <span className="text-sm text-gray-700">Blocked</span>
                          </label>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <p className="text-white">Loading companies...</p>
        )}

        <button
          className="mt-6 w-full py-3 bg-[#030712] text-white text-lg rounded-md hover:bg-[#031f29] transition"
          onClick={handleSubmit}
        >
          Submit Rankings
        </button>
      </div>
    </div>
  );
}