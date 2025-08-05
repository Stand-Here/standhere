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
  borderRadius: "8px",
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
  const [country, setCountry] = useState("Unknown Location");
  const mapRef = useRef(null);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0", // ⚠️ Use env var in production
  });

  const fetchCountryAndCity = (lat, lon) => {
  if (!window.google) return;

  const geocoder = new window.google.maps.Geocoder();
  const latlng = { lat, lng: lon };

  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === "OK" && results.length > 0) {
      const components = results[0].address_components;

      const countryComponent = components.find((c) =>
        c.types.includes("country")
      );
      const cityComponent =
        components.find((c) => c.types.includes("locality")) ||
        components.find((c) => c.types.includes("administrative_area_level_1")) ||
        components.find((c) => c.types.includes("postal_town"));

      const country = countryComponent ? countryComponent.long_name : "Unknown";
      const city = cityComponent ? cityComponent.long_name : null;

      if (city) {
        setCountry(`${city}, ${country}`);
      } else {
        setCountry(country);
      }
    } else {
      console.error("Geocoder failed due to: " + status);
      setCountry("Unknown");
    }
  });
};




  useEffect(() => {
    if (!isLoaded) return;

    fetchCountryAndCity(coordinate.lat, coordinate.lon);
;

    const svService = new window.google.maps.StreetViewService();
    const latLng = new window.google.maps.LatLng(
      coordinate.lat,
      coordinate.lon
    );

    svService.getPanorama({ location: latLng, radius: 100 }, (data, status) => {
      if (status === window.google.maps.StreetViewStatus.OK) {
        setStreetViewAvailable(true);
      } else {
        setStreetViewAvailable(false);
      }
    });
  }, [coordinate, isLoaded]);

  const handleNewPlace = () => {
    const newCoord = getRandomCoordinate();
    setCoordinate(newCoord);
    setZoomLevel(5);

    if (mapRef.current) {
      mapRef.current.setZoom(5);
      mapRef.current.panTo({ lat: newCoord.lat, lng: newCoord.lon });

      let currentZoom = 5;
      const targetZoom = 16;
      const step = 1;
      const interval = 250;

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
      <p>
        Country:{" "}
        <strong>
          {country}
        </strong>
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
