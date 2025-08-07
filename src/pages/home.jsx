import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  StreetViewPanorama,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import roadCoordinates from "../../scripts/roads_coords.json";
import youBroughtItems from "../../scripts/items.json";

const baseMapOptions = {
  mapTypeId: "satellite",
  rotateControl: true,
  streetViewControl: false,
  styles: [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const btnStyle = {
  margin: "0 0.5rem",
  padding: "0.7rem 1.4rem",
  fontSize: "1rem",
  backgroundColor: "#333",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

function countryCodeToTwemojiUrl(code) {
  const base = "https://twemoji.maxcdn.com/v/latest/svg/";
  const hex = code
    .toUpperCase()
    .split("")
    .map(c => (0x1f1e6 + c.charCodeAt(0) - 65).toString(16))
    .join("-");
  return `${base}${hex}.svg`;
}


function getRandomCoordinate() {
  const idx = Math.floor(Math.random() * roadCoordinates.length);
  const { lat, lng } = roadCoordinates[idx];
  return { lat, lon: lng };
}

function pickN(arr, n) {
  const picked = new Set();
  while (picked.size < n) {
    picked.add(arr[Math.floor(Math.random() * arr.length)]);
  }
  return Array.from(picked);
}

function apply3D(map, enable) {
  if (!map) return;
  map.setTilt(enable ? 45 : 0);
  map.setHeading(enable ? 90 : 0);
}

export default function Home() {

  const mapRef = useRef(null);

  const [coordinate, setCoordinate] = useState(getRandomCoordinate());
  const [zoomLevel, setZoomLevel] = useState(5);
  const [showStreetView, setShowStreetView] = useState(false);
  const [streetViewAvailable, setStreetViewAvailable] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const [country, setCountry] = useState("Unknown Location");
  const [countryCode, setCountryCode] = useState("");
  const [brought, setBrought] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(true);

  // debugging - console.log("API KEY:", import.meta.env.VITE_MAPS_API_KEY);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
  });

  useEffect(() => {
    setBrought(pickN(youBroughtItems, 3));
  }, [coordinate]);

  function onMapLoad(map) {
    mapRef.current = map;
    map.setZoom(18);
    apply3D(map, is3D && !streetViewAvailable);
  }

  useEffect(() => {
    if (mapRef.current) {
      apply3D(mapRef.current, is3D && !streetViewAvailable);
    }
  }, [is3D, streetViewAvailable]);

  useEffect(() => {
    if (!isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: coordinate.lat, lng: coordinate.lon } },
      (results, status) => {
        if (status === "OK" && results.length) {
          const comps = results[0].address_components;
          const countryComp = comps.find((c) => c.types.includes("country"));
          const cityComp =
            comps.find((c) => c.types.includes("locality")) ||
            comps.find((c) => c.types.includes("administrative_area_level_1")) ||
            comps.find((c) => c.types.includes("postal_town"));
          setCountryCode(countryComp.short_name);

          setCountry(
            cityComp
              ? `${cityComp.long_name}, ${countryComp.long_name}`
              : countryComp.long_name
          );
        } else {
          setCountryCode("");
          setCountry("Unknown");
        }
      }
    );

    const sv = new window.google.maps.StreetViewService();
    sv.getPanorama(
      {
        location: { lat: coordinate.lat, lng: coordinate.lon },
        radius: 100,
      },
      (_, status) => {
        const avail = status === window.google.maps.StreetViewStatus.OK;
        setStreetViewAvailable(avail);
        setShowStreetView(avail);
      }
    );
  }, [coordinate, isLoaded]);

  function handleNewPlace() {
    const coord = getRandomCoordinate();
    setCoordinate(coord);
    setZoomLevel(5);
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.panTo({ lat: coord.lat, lng: coord.lon });
    map.setZoom(5);
    map.setTilt(0);
    map.setHeading(0);

    let z = 5;
    const iv = setInterval(() => {
      z += 1;
      if (z > 18) {
        clearInterval(iv);
        if (is3D && !streetViewAvailable) apply3D(map, true);
        return;
      }
      map.setZoom(z);
      setZoomLevel(z);
    }, 250);
  }

  const lightGradient =
    "linear-gradient(135deg, #EAF2F8 0%, #FFFFFF 100%)";
  const darkGradient =
    "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)";
  const darkCard = "#005050";
  const lightCard = "#FFFFFF";
  const cardColor = isDarkMode ? darkCard : lightCard;
  const bgColor = isDarkMode ? darkGradient : lightGradient;
  const textColor = isDarkMode ? "#fff" : "#000";
  const textSecondaryColor = isDarkMode ? "#ddd" : "#111";

return (
  <>
    {/* Full-screen background */}
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: bgColor,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background 0.5s ease",
      }}
    />

    {/* Header with flex-centered emoji + text */}
    <header
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "2rem",
        paddingBottom: "1rem",
      }}
    >
      <h1
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: textColor,
        }}
      >
        <span role="img" aria-label="globe" style={{ fontSize: "2.5rem" }}>
          🌍
        </span>
        Stand Here.
      </h1>
    </header>

    {/* Main Content */}
    <main
      id="main-content"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      {/* Coordinates & "You brought" block */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
          maxWidth: "700px",
          marginBottom: "1.5rem",
          width: "100%",
        }}
      >
        {/* Coordinates + Location */}
        <div
          style={{
            textAlign: "center",
            minWidth: 200,
            color: textSecondaryColor,
            flex: "1 1 250px",
          }}
        >
          <p>
            Coordinates:{" "}
            <strong>
              {coordinate.lat.toFixed(6)}, {coordinate.lon.toFixed(6)}
            </strong>
          </p>
          <p>
            Location: <strong>{country}</strong>
          </p>

          {countryCode && (
  <img
    src={countryCodeToTwemojiUrl(countryCode)}
    alt={`${countryCode} flag`}
    style={{ width: "5rem", height: "5rem", marginTop: "0.5rem" }}
  />
)}
            

        </div>

        {/* You brought card */}
        <div
          style={{
            backgroundColor: cardColor,
            borderRadius: "8px",
            padding: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            color: textColor,
            minWidth: 280,
            textAlign: "center",
            flex: "1 1 280px",
          }}
        >
          <h3>You brought:</h3>
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {brought.map((item, i) => (
              <li key={i} style={{ marginBottom: "0.5em" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Map container */}
      {isLoaded && (
        <div
          style={{
            width: "90vw",
            maxWidth: "800px",
            height: "55vh",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            margin: "1rem auto",
          }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: coordinate.lat, lng: coordinate.lon }}
            zoom={zoomLevel}
            onLoad={onMapLoad}
            options={baseMapOptions}
          >
            {streetViewAvailable && showStreetView ? (
              <StreetViewPanorama
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                visible
                options={{ pov: { heading: 100, pitch: 0 }, zoom: 1 }}
              />
            ) : (
              <Marker
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                onClick={() => {
                  const map = mapRef.current;
                  if (!map) return;
                  map.panTo({ lat: coordinate.lat, lng: coordinate.lon });
                  map.setZoom(18);
                  setZoomLevel(18);
                  if (is3D) apply3D(map, true);
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={handleNewPlace} style={btnStyle}>
          Show me another spot
        </button>
        <button
          onClick={() =>
            streetViewAvailable && setShowStreetView((v) => !v)
          }
          style={{
            ...btnStyle,
            backgroundColor: streetViewAvailable ? "#333" : "#777",
            cursor: streetViewAvailable ? "pointer" : "not-allowed",
          }}
        >
          {showStreetView ? "Switch to Map View" : "Switch to Street View"}
        </button>
      </div>
    </main>

    {/* Footer */}
    <footer
      style={{
        textAlign: "center",
        padding: "1rem",
        color: textColor,
        borderTop: `1px solid ${isDarkMode ? "#004040" : "#ccc"}`,
        marginTop: "2rem",
        marginBottom: "1rem",
      }}
    >
      © 2025 Stand Here. All rights reserved.
    </footer>
  </>
);

}