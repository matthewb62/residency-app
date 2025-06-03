import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const supabase = createClient(
  "https://skavheoivhbrtddpvkog.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZoZW9pdmhicnRkZHB2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjQwOTMsImV4cCI6MjA2NDEwMDA5M30.M9mPXBsmtxXKfHwcCPbbFSIWPFv0R3aAO0L4EQCi77g"
);

// CONSTANT - WILL BE CHANGED LATER
const studentEmail = "24408026@studentmail.ul.ie";

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
   // const studentEmail = prompt("Enter your student email");
    if (!studentEmail) return alert("Email required");
  
    const ranked = [];
    let rank = 1;
    
    companies.forEach((company) => {
      if (blocked.has(company.company_id)) {
        ranked.push({
          student_email: studentEmail,
          company_id: company.company_id,
          ranking: 9999,
        });
      } else {
        ranked.push({
          student_email: studentEmail,
          company_id: company.company_id,
          ranking: rank++,
        });
      }
    });
  
    console.log(ranked); // for debugging
  
    // 🔥 delete any old rankings for this student before inserting
    await supabase
      .from("student_rankings")
      .delete()
      .eq("student_email", studentEmail);
  
    const { error: insertError } = await supabase
      .from("student_rankings")
      .insert(ranked);
  
    if (insertError) {
      console.error(insertError);
      return alert("Error saving rankings to Supabase");
    }
  
    alert("Submitted successfully!");
  };
  
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rank Companies</h1>
      {companies.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="companies">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-[200px]"
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
                        className="flex justify-between items-center p-2 border-b bg-white cursor-move"
                      >
                        <span>{company.name}</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={blocked.has(company.company_id)}
                            onChange={() => toggleBlock(company.company_id)}
                          />
                          <span className="text-sm">Blocked</span>
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
        <p>Loading companies...</p>
      )}
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
      >
        Submit Rankings
      </button>
    </div>
  );
}
