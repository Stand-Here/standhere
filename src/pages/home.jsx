import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  StreetViewPanorama,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import roadCoordinates from "../../scripts/roads_coords.json";
import youBroughtItems from "../../scripts/items.json";

const containerStyle = {
  width: "150%",
  height: "60vh",
  position: "relative",
  left: "50%",
  transform: "translateX(-50%)",
  borderRadius: "8px",
};

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

// helper to pick a random road coordinate
function getRandomCoordinate() {
  const idx = Math.floor(Math.random() * roadCoordinates.length);
  const { lat, lng } = roadCoordinates[idx];
  return { lat, lon: lng };
}

// pick n distinct random items from an array
function pickN(arr, n) {
  const picked = new Set();
  while (picked.size < n) {
    picked.add(arr[Math.floor(Math.random() * arr.length)]);
  }
  return Array.from(picked);
}

// helper to apply or remove the 45° tilt
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
  const [brought, setBrought] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [customLightColor, setCustomLightColor] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0",
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mql.matches);
    const listener = e => setIsDarkMode(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  // On each new coordinate, pick 3 items
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

  // Fetch country/city + check Street View
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
            comps.find((c) =>
              c.types.includes("administrative_area_level_1")
            ) ||
            comps.find((c) => c.types.includes("postal_town"));
          setCountry(
            cityComp
              ? `${cityComp.long_name}, ${countryComp.long_name}`
              : countryComp.long_name
          );
        } else {
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

  const defaultDark = '#194a69';
  const defaultLight = '#f5f3e7';
  const boxColor = isDarkMode ? defaultDark : (customLightColor || defaultLight);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>🌍 Stand Here.</h1>

      <p>
        Coordinates:{" "}
        <strong>
          {coordinate.lat.toFixed(6)}, {coordinate.lon.toFixed(6)}
        </strong>
      </p>
      <p>
        Location: <strong>{country}</strong>
      </p>

      {/* Custom color picker in light mode */}
      {!isDarkMode && (
        <div style={{ margin: '1rem' }}>
          <label>
            Light mode box color:&nbsp;
            <input
              type="color"
              value={customLightColor || defaultLight}
              onChange={e => setCustomLightColor(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* You brought box */}
      <div
        style={{
          margin: "1rem auto",
          padding: "1rem",
          maxWidth: "400px",
          background: boxColor,
          borderRadius: "8px",
          textAlign: "left",
        }}
      >
        <h3 style={{ color: isDarkMode ? '#fff' : '#000' }}>You brought:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.2em', color: isDarkMode ? '#fff' : '#000' }}>
          {brought.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      
      {isLoaded && (
        <div style={containerStyle}>
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
                  if (is3D && !streetViewAvailable) apply3D(map, true);
                  else apply3D(map, false);
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleNewPlace} style={btnStyle}>
          Show me another spot
        </button>
        <button
          onClick={() => {
            if (streetViewAvailable) setShowStreetView((v) => !v);
          }}
          disabled={!streetViewAvailable}
          style={{
            ...btnStyle,
            backgroundColor: streetViewAvailable ? "#333" : "#777",
            cursor: streetViewAvailable ? "pointer" : "not-allowed",
          }}
        >
          {showStreetView ? "Switch to Map View" : "Switch to Street View"}
        </button>
        <button onClick={() => setIs3D((v) => !v)} style={btnStyle}>
          {is3D ? "Turn 2D" : "Turn 3D"}
        </button>
      </div>
    </div>
  );
}
