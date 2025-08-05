import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  StreetViewPanorama,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import landCoordinates from "../../scripts/land_coordinates.json";

const containerStyle = {
  width: "80%",
  height: "500px",
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
  const [showStreetView, setShowStreetView] = useState(true);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5); // Start zoomed out
  const mapRef = useRef(null);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0", // ⚠️ move to env in prod
  });

  const handleNewPlace = () => {
  const newCoord = getRandomCoordinate();
  setCoordinate(newCoord);
  setZoomLevel(5);

  if (mapRef.current) {
    mapRef.current.setZoom(5);
    mapRef.current.panTo({ lat: newCoord.lat, lng: newCoord.lon });

    // Smooth zoom transition
    let currentZoom = 1;
    const targetZoom = 16;
    const step = 1;
    const interval = 300; // ms between steps

    const zoomInterval = setInterval(() => {
      currentZoom += step;
      if (currentZoom > targetZoom) {
        clearInterval(zoomInterval);
        return;
      }
      mapRef.current.setZoom(currentZoom);
      setZoomLevel(currentZoom);
    }, interval);
  }
};


  useEffect(() => {
    if (!isLoaded) return;

    const svService = new window.google.maps.StreetViewService();
    const latLng = new window.google.maps.LatLng(coordinate.lat, coordinate.lon);

    svService.getPanorama(
      { location: latLng, radius: 100 },
      (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          setStreetViewAvailable(true);
        } else {
          setStreetViewAvailable(false);
        }
      }
    );
  }, [coordinate, isLoaded]);

  const toggleView = () => {
    setShowStreetView((prev) => !prev);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>🌍 Stand Here.</h1>
      <p>
        Coordinates: <strong>{coordinate.lat}</strong>,{" "}
        <strong>{coordinate.lon}</strong>
      </p>

      {isLoaded && (
        <div style={containerStyle}>
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "100%" }}
            center={{ lat: coordinate.lat, lng: coordinate.lon }}
            zoom={zoomLevel}
            onLoad={onMapLoad}
            mapTypeId="satellite"
            options={{
              streetViewControl: false,
              styles: [
                {
                  featureType: "all",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {showStreetView && streetViewAvailable ? (
              <StreetViewPanorama
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                visible={true}
                options={{
                  pov: { heading: 100, pitch: 0 },
                  zoom: 1,
                }}
              />
            ) : (
              <Marker
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.panTo({
                      lat: coordinate.lat,
                      lng: coordinate.lon,
                    });
                    mapRef.current.setZoom(17);
                    setZoomLevel(17);
                  }
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}

      {showStreetView && !streetViewAvailable && (
        <p style={{ color: "#888" }}>
          No Street View available for this location. Showing map view instead.
        </p>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleNewPlace}
          style={{
            marginRight: "1rem",
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

        <button
          onClick={toggleView}
          style={{
            padding: "0.7rem 1.4rem",
            fontSize: "1rem",
            backgroundColor: "#555",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showStreetView ? "Switch to Map View" : "Switch to Street View"}
        </button>
      </div>
    </div>
  );
}
