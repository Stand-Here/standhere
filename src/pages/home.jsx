import React, { useState, useCallback } from "react";
import { GoogleMap, StreetViewPanorama, useJsApiLoader } from "@react-google-maps/api";
import landCoordinates from "../../scripts/land_coordinates.json";

const containerStyle = {
  width: "80%",
  height: "400px",
  margin: "1rem auto",
  borderRadius: "8px"
};

function getRandomCoordinate() {
  const idx = Math.floor(Math.random() * landCoordinates.length);
  const [lat, lon] = landCoordinates[idx];
  return { lat, lon };
}

export default function Home() {
  const [coordinate, setCoordinate] = useState(getRandomCoordinate());

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0" // 🔑 Replace with your actual API key
  });

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

      {isLoaded && (
        <>
          {/* Street View */}
          <div style={containerStyle}>
            <GoogleMap
              mapContainerStyle={{ height: "100%", width: "100%" }}
              center={{ lat: coordinate.lat, lng: coordinate.lon }}
              zoom={16}
              options={{ streetViewControl: false }}
            >
              <StreetViewPanorama
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                visible={true}
                options={{ pov: { heading: 100, pitch: 0 } }}
              />
            </GoogleMap>
          </div>
        </>
      )}

      <button
        onClick={handleNewPlace}
        style={{
          padding: "0.7rem 1.4rem",
          fontSize: "1rem",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Show me another spot
      </button>
    </div>
  );
}
