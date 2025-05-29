import React, { useState } from "react";

export default function StudentPage() {
  const [name, setName] = useState("");
  const [qca, setQca] = useState("");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name,
      qca: parseFloat(qca),
      preferences: preferences.split(",").map(p => p.trim()),
      blockedCompanies: [] // add UI later
    };

    const res = await fetch("http://localhost:8080/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const matches = await res.json();
    setResult(matches);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Submit Your Preferences</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><br />
        <input placeholder="QCA" value={qca} onChange={(e) => setQca(e.target.value)} /><br />
        <input placeholder="Preferences (comma separated)" value={preferences} onChange={(e) => setPreferences(e.target.value)} /><br />
        <button type="submit">Submit</button>
      </form>
      <div>
        <h3>Matched Companies:</h3>
        <ul>
          {result.map((company, idx) => <li key={idx}>{company}</li>)}
        </ul>
      </div>
    </div>
  );
}
