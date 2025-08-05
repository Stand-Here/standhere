// src/pages/home.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import landCoordinates from "../../scripts/land_coordinates.json";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url),
});

function getRandomCoordinate() {
  const idx = Math.floor(Math.random() * landCoordinates.length);
  const [lat, lon] = landCoordinates[idx];
  return { lat, lon };
}

export default function Home() {
  const [coordinate, setCoordinate] = useState(getRandomCoordinate());

  const handleNewPlace = () => {
    setCoordinate(getRandomCoordinate());
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>🌍 Stand Here.</h1>
      <p>
        Coordinates: <strong>{coordinate.lat}</strong>,{" "}
        <strong>{coordinate.lon}</strong>
      </p>

      <div style={{ height: "400px", width: "80%", margin: "1rem auto" }}>
        <MapContainer
          center={[coordinate.lat, coordinate.lon]}
          zoom={5}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <Marker position={[coordinate.lat, coordinate.lon]}>
            <Popup>Stand here.</Popup>
          </Marker>
        </MapContainer>
      </div>

      <button
        onClick={handleNewPlace}
        style={{
          padding: "0.7rem 1.4rem",
          fontSize: "1rem",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Show me another spot
      </button>
    </div>
  );
}
