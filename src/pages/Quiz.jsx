import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Quiz() {
  const [sectors, setSectors] = useState([]);
  const [counties, setCounties] = useState([]);
  const [tools, setTools] = useState([]);
  const [locationRatings, setLocationRatings] = useState({});
  const [sectorRatings, setSectorRatings] = useState({});
  const [sizeRatings, setSizeRatings] = useState({});
  const [techPreferences, setTechPreferences] = useState([]);
  const [payImportance, setPayImportance] = useState(3);
  const [remoteImportance, setRemoteImportance] = useState(3);
  const [duration, setDuration] = useState("Residency 1");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttributes = async () => {
      const { data, error } = await supabase.from("company_data").select("*");
      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      const sectorSet = new Set();
      const countySet = new Set();
      const toolSet = new Set();

      data.forEach((company) => {
        if (company.sector) sectorSet.add(company.sector.trim());
        if (company.county && company.location_type === "Ireland") {
          countySet.add(company.county.trim());
        }
        if (company["languages/tools"]) {
          company["languages/tools"]
            .split(",")
            .map((tool) => tool.trim())
            .filter((tool) => tool.length > 0)
            .forEach((tool) => toolSet.add(tool));
        }
      });

      setSectors([...sectorSet]);
      setCounties([...countySet]);
      setTools([...toolSet]);
    };

    fetchAttributes();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      locationRatings,
      duration,
      sectorRatings,
      sizeRatings,
      techPreferences,
      payImportance,
      remoteImportance,
    };

    try {
      const res = await fetch("http://localhost:8080/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Residency Quiz</h1>

      {/* Location Ratings */}
      <h2 className="font-semibold">Rate Locations:</h2>
      {counties.map((county) => (
        <div key={county} className="mb-2">
          <label>{county}: </label>
          <input
            type="range"
            min="1"
            max="5"
            value={locationRatings[county] || 3}
            onChange={(e) =>
              setLocationRatings({ ...locationRatings, [county]: parseInt(e.target.value) })
            }
          />
        </div>
      ))}

      {/* Sector Ratings */}
      <h2 className="font-semibold mt-4">Rate Sectors:</h2>
      {sectors.map((sector) => (
        <div key={sector} className="mb-2">
          <label>{sector}: </label>
          <input
            type="range"
            min="1"
            max="5"
            value={sectorRatings[sector] || 3}
            onChange={(e) =>
              setSectorRatings({ ...sectorRatings, [sector]: parseInt(e.target.value) })
            }
          />
        </div>
      ))}

      {/* Tech Preferences */}
      <h2 className="font-semibold mt-4">Select Preferred Tools (max 3):</h2>
      {tools.map((tool) => (
        <div key={tool}>
          <label>
            <input
              type="checkbox"
              checked={techPreferences.includes(tool)}
              disabled={!techPreferences.includes(tool) && techPreferences.length >= 3}
              onChange={(e) => {
                setTechPreferences((prev) => {
                  if (e.target.checked) {
                    if (prev.length < 3) {
                      return [...prev, tool];
                    } else {
                      alert("You can only select up to 3 tools.");
                      return prev;
                    }
                  } else {
                    return prev.filter((t) => t !== tool);
                  }
                });
              }}
            />
            {tool}
          </label>
        </div>
      ))}

      {/* Company Size Ratings */}
      <h2 className="font-semibold mt-4">Rate Company Sizes:</h2>
      {["Startup", "Small Company", "Medium", "Large", "Multinational"].map((size) => (
        <div key={size}>
          <label>{size}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={sizeRatings[size] || 3}
            onChange={(e) =>
              setSizeRatings({ ...sizeRatings, [size]: parseInt(e.target.value) })
            }
          />
        </div>
      ))}

      {/* Pay & Remote */}
      <div className="mt-4">
        <label>Pay Importance (1–5):</label>
        <input
          type="range"
          min="1"
          max="5"
          value={payImportance}
          onChange={(e) => setPayImportance(parseInt(e.target.value))}
        />
      </div>

      <div>
        <label>Remote Preference (1–5):</label>
        <input
          type="range"
          min="1"
          max="5"
          value={remoteImportance}
          onChange={(e) => setRemoteImportance(parseInt(e.target.value))}
        />
      </div>

      {/* Duration */}
      <div className="mt-4">
        <label>Duration:</label>
        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option>Residency 1</option>
          <option>Residency 2</option>
          <option>Residency 1+2</option>
          <option>Open</option>
        </select>
      </div>

      {/* Submit */}
      <button
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Matching..." : "Find Matches"}
      </button>

      {/* Results */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Top Matches:</h2>
        {results.length === 0 && !loading && <p>No matches found.</p>}
        {results.map((name, idx) => (
          <div key={idx} className="border-b py-2">{name}</div>
        ))}
      </div>
    </div>
  );
}

