// CompanyRanking.jsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const supabase = createClient(
  "https://skavheoivhbrtddpvkog.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZoZW9pdmhicnRkZHB2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjQwOTMsImV4cCI6MjA2NDEwMDA5M30.M9mPXBsmtxXKfHwcCPbbFSIWPFv0R3aAO0L4EQCi77g"
);

export default function CompanyRanking() {
  const [students, setStudents] = useState([]);
  const companyId = localStorage.getItem("company_id");

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("student_account")
        .select("student_email, name");

      if (!error && data) {
        const formatted = data.map((s) => ({
          id: s.student_email,
          name: s.name,
          email: s.student_email,
        }));
        setStudents(formatted);
      }
    };
    fetchStudents();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(students);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setStudents(updated);
  };

  const handleSubmit = async () => {
    const rankings = students.map((student, index) => ({
      company_id: companyId,
      student_email: student.email,
      rank: index + 1,
      ranked_by: "company",
    }));

    const { error } = await supabase
      .from("rankings")
      .upsert(rankings, {
        onConflict: ["student_email", "company_id", "ranked_by"],
      });

    if (error) {
      alert("Error saving rankings to Supabase");
    } else {
      alert("Rankings submitted successfully!");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-8"
      style={{ backgroundImage: "url('/comphub_bg.png')" }}
    >
      <div className="w-full max-w-2xl bg-[#101828cc] backdrop-blur p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          🧑‍🎓 Rank Students
        </h1>

        {students.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="students">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] divide-y divide-gray-300"
                >
                  {students.map((student, index) => (
                    <Draggable
                      key={student.id}
                      draggableId={student.id}
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
                            {student.name} ({student.email})
                          </span>
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
          <p className="text-white">Loading students...</p>
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
