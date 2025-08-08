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
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background-color 0.3s ease, transform 0.2s ease",
  userSelect: "none",
};
const btnHoverStyle = {
  backgroundColor: "#555",
  transform: "scale(1.05)",
};

function countryCodeToTwemojiUrl(code) {
  const base = "https://twemoji.maxcdn.com/v/latest/svg/";
  const hex = code
    .toUpperCase()
    .split("")
    .map((c) => (0x1f1e6 + c.charCodeAt(0) - 65).toString(16))
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

  const lightGradient = "linear-gradient(135deg, #EAF2F8 0%, #FFFFFF 100%)";
  const darkGradient = "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)";
  const darkCard = "#005050";
  const lightCard = "#FFFFFF";
  const cardColor = isDarkMode ? darkCard : lightCard;
  const bgColor = isDarkMode ? darkGradient : lightGradient;
  const textColor = isDarkMode ? "#fff" : "#000";
  const textSecondaryColor = isDarkMode ? "#ddd" : "#111";
  const contentMax = 800;
  const pageWrap = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
    fontFamily: "'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: textColor,
  };

  // Local state for hover on buttons
  const [btnHover, setBtnHover] = useState(null);

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
      <div style={pageWrap}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "2.75rem",
              marginBottom: "0.25rem",
              fontWeight: "700",
              color: textColor,
            }}
          >
            <span role="img" aria-label="globe" style={{ marginRight: "0.5rem" }}>
              🌍
            </span>
            Stand Here.
          </h1>
          <h2
            style={{
              fontWeight: "400",
              fontSize: "1.5rem",
              color: "#80cfff",
              fontStyle: "italic",
              marginTop: 0,
              marginBottom: "0",
            }}
          >
            Discover places, tell your story.
          </h2>
        </header>

        {/* Main Content */}
        <main
          id="main-content"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "3rem",
            minHeight: "100vh",
            textAlign: "center",
            gap: "2rem",
          }}
        >
          {/* Coordinates & "You brought" block */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              width: "100%",
              maxWidth: contentMax,
              margin: "0 auto",
              alignItems: "stretch",
            }}
          >
            {/* Coordinates + Location */}
            <div
              style={{
                textAlign: "center",
                color: textSecondaryColor,
                padding: "1rem 1.25rem",
                backgroundColor: isDarkMode ? "rgba(0,80,80,0.3)" : "rgba(255,255,255,0.8)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontFamily: "'Roboto Mono', monospace",
                fontSize: "1.1rem",
                userSelect: "text",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
                minHeight: "200px",
                justifyContent: "center",
              }}
            >
              <p>
                Coordinates:{" "}
                <strong>
                  {coordinate.lat.toFixed(2)}, {coordinate.lon.toFixed(2)}
                </strong>
              </p>
              <p>
                Location: <strong>{country}</strong>
              </p>
              {countryCode && (
                <img
                  src={countryCodeToTwemojiUrl(countryCode)}
                  alt={`${countryCode} flag`}
                  style={{
                    width: "5rem",
                    height: "5rem",
                    marginTop: "0.5rem",
                    borderRadius: "50%",
                    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                  }}
                />
              )}
            </div>

            {/* You brought card */}
            <div
              style={{
                backgroundColor: cardColor,
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                color: textColor,
                textAlign: "center",
                flex: "1 1 280px",
                border: `2px solid ${textColor}`,
                fontSize: "1rem",
                fontWeight: "400",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                userSelect: "none",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                }}
              >
                You brought:
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  margin: 0,
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                  color: textColor,
                }}
              >
                {brought.map((item, i) => (
                  <li key={i} style={{ marginBottom: "0.7em" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Map container */}
          <div
            style={{
              width: "100%",
              maxWidth: contentMax,
              height: "55vh",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 0 20px rgba(0,0,0,0.35)",
              margin: "1rem auto",
              position: "relative",
              backgroundColor: "#000", // fallback bg while loading
            }}
          >
            {!isLoaded && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: textSecondaryColor,
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  userSelect: "none",
                }}
              >
                Loading map...
              </div>
            )}
            {isLoaded && (
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
            )}
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
              maxWidth: contentMax,
              width: "100%",
            }}
          >
            <button
              onClick={handleNewPlace}
              style={{
                ...btnStyle,
                ...(btnHover === "new" ? btnHoverStyle : {}),
              }}
              onMouseEnter={() => setBtnHover("new")}
              onMouseLeave={() => setBtnHover(null)}
              aria-label="Show me another spot"
            >
              Show me another spot
            </button>
            <button
              onClick={() => streetViewAvailable && setShowStreetView((v) => !v)}
              style={{
                ...btnStyle,
                backgroundColor: streetViewAvailable ? "#333" : "#777",
                cursor: streetViewAvailable ? "pointer" : "not-allowed",
                ...(btnHover === "toggle" ? btnHoverStyle : {}),
              }}
              onMouseEnter={() => setBtnHover("toggle")}
              onMouseLeave={() => setBtnHover(null)}
              disabled={!streetViewAvailable}
              aria-label={showStreetView ? "Switch to Map View" : "Switch to Street View"}
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
            fontSize: "0.9rem",
            userSelect: "none",
          }}
        >
          © 2025 Stand Here. All rights reserved.
        </footer>
      </div>
    </>
  );
}
