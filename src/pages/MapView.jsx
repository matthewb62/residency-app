import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../supabaseClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapView() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase
        .from("company_data")
        .select("company_name, sector, monthly_salary, latitude, longitude");

      if (error) {
        console.error("Supabase fetch error:", error.message);
      } else {
        console.log("Loaded companies:", data);
        setCompanies(data);
      }
    }
    fetchCompanies();
  }, []);

  const defaultCenter = [53.1424, -7.6921]; // Ireland

  return (
    <div className="h-screen w-full">
      <MapContainer center={defaultCenter} zoom={7} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {companies.map((company, index) => {
          const { company_name, sector, monthly_salary, latitude, longitude } = company;
          console.log(`Marker candidate:`, company);
          if (latitude == null || longitude == null) return null; // Skip invalid positions

          return (
            <Marker key={index} position={[latitude, longitude]}>
              <Popup>
                <strong>{company_name}</strong><br />
                Sector: {sector}<br />
                Pay: €{monthly_salary}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
