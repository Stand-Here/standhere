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

function countryCodeToEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65)
    );
}

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
  const [countryCode, setCountryCode] = useState("");
  const [brought, setBrought] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customLightColor, setCustomLightColor] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0",
  });

  /*
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mql.matches);
    const listener = e => setIsDarkMode(e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);*/

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

    useEffect(() => {
    if (!isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: coordinate.lat, lng: coordinate.lon } },
      (results, status) => {
        if (status === "OK" && results.length) {
          const comps = results[0].address_components;
          const countryComp = comps.find(c => c.types.includes("country"));
           const cityComp =
            comps.find(c => c.types.includes("locality")) ||
            comps.find(c => c.types.includes("administrative_area_level_1")) ||
            comps.find(c => c.types.includes("postal_town"));
          setCountryCode(countryComp.short_name);            // <-- add this

          setCountry(
            cityComp
              ? `${cityComp.long_name}, ${countryComp.long_name}`
              : countryComp.long_name
          );
        } else {
+         setCountryCode("");
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

  const lightGradient = "linear-gradient(135deg, #EAF2F8 0%, #FFFFFF 100%)"; // light green to blue
  const darkGradient = "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)";  // darker green to darker blue
  const defaultDark = '#005050';
  const defaultLight = '#FFFFFF';
  const darkCard   = "#005050";
  const lightCard  = "#FFFFFF";
  const cardColor  = isDarkMode ? darkCard : lightCard;
  const bgColor    = isDarkMode ? darkGradient : lightGradient;

  return (
    <>
      {/* Full-screen background */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: -1,
          background: bgColor,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background 0.5s ease',
        }}
      />

      <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
        <h1 style={{ color: isDarkMode ? '#fff' : '#000' }}>🌍 Stand Here.</h1>
      </div>

      {/* Info + card aligned above map */}
      <div
        style={{
          width: '90vw',
          maxWidth: '800px',
          margin: '0.5rem auto 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
            style = {{
                width: '50%', 
                textAlign: 'center',
                color: isDarkMode ? '#ddd' : '#111',
            }}
        >
          <p>Coordinates: <strong>{coordinate.lat.toFixed(6)}, {coordinate.lon.toFixed(6)}</strong></p>
          <p>Location: <strong>{country}</strong></p>
        
        {/* flag emoji below the location */}
         {countryCode && (
           <p style={{ fontSize: '2rem', margin: '0.5rem 0 0 0' }}>
             {countryCodeToEmoji(countryCode)}
           </p>
         )}
        </div>

        <div
            style = {{
                width : '50%', 
                backgroundColor: cardColor, 
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                color: isDarkMode ? '#fff' : '#000',    
            }}
          >
          <h3>You brought:</h3>
          <ul style={{ listStyle : 'none', paddingLeft: 0, margin: 0 }}>
            {brought.map((item, i) => <li key={i} style={{marginBottom: '0.5em'}}>{item}</li>)}
          </ul>
        </div>
      </div>

      {/* Map container */}
      {isLoaded && (
        <div
          style={{
            width: '90vw',
            maxWidth: '800px',
            height: '55vh',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 0 15px rgba(0,0,0,0.3)',
            margin: '1rem auto',
          }}
        >
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={handleNewPlace} style={btnStyle}>Show me another spot</button>
        <button
          onClick={() => streetViewAvailable && setShowStreetView(v => !v)}
          style={{ ...btnStyle, backgroundColor: streetViewAvailable ? '#333' : '#777', cursor: streetViewAvailable ? 'pointer' : 'not-allowed' }}
        >
          {showStreetView ? 'Switch to Map View' : 'Switch to Street View'}
        </button>
      </div>
    </>
  );
}
