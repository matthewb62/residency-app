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
            const { data, error } = await supabase.from("company_map_data").select("*");
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


                <Marker position={[52.6730648, -8.5691814]}>
                    <Popup>
                        <strong>Analog Devices</strong><br />
                        Sector: Semiconductor<br />
                        Pay: €2500
                    </Popup>
                </Marker>
                <Marker position={[53.3306075, -6.2474079]}>
                    <Popup>
                        <strong>Amazon Web Services</strong><br />
                        Sector: Web Services<br />
                        Pay: €3000
                    </Popup>
                </Marker>
                <Marker position={[53.3025274, -8.9848963]}>
                    <Popup>
                        <strong>Fidelity Investments</strong><br />
                        Sector: Investment Services<br />
                        Pay: €2500
                    </Popup>
                </Marker>

            </MapContainer>
        </div>
    );
}
