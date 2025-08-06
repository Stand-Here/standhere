import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  StreetViewPanorama,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import roadCoordinates from "../../scripts/roads_coords.json";

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

// helper to apply or remove the 45° tilt
function apply3D(map, enable) {
  map.setTilt(enable ? 45 : 0);
  map.setHeading(enable ? 90 : 0);
}

export default function Home() {
  const mapRef = useRef(null);

  const [coordinate, setCoordinate] = useState(getRandomCoordinate());
  const [zoomLevel, setZoomLevel] = useState(5);
  const [showStreetView, setShowStreetView] = useState(true);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [country, setCountry] = useState("Unknown Location");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0",
  });

  // when map loads, save ref and apply tilt/heading
  function onMapLoad(map) {
    mapRef.current = map;
    apply3D(map, is3D);
  }

  // re-apply 3D whenever the flag changes
  useEffect(() => {
    if (mapRef.current) apply3D(mapRef.current, is3D);
  }, [is3D]);

  // fetch country/city via Geocoder & check Street View availability
  useEffect(() => {
    if (!isLoaded) return;
    // reverse geocode
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: coordinate.lat, lng: coordinate.lon } },
      (results, status) => {
        if (status === "OK" && results.length) {
          const comps = results[0].address_components;
          const countryComp = comps.find((c) =>
            c.types.includes("country")
          );
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

    // Street View check
    const sv = new window.google.maps.StreetViewService();
    sv.getPanorama(
      {
        location: { lat: coordinate.lat, lng: coordinate.lon },
        radius: 100,
      },
      (_, status) => {
        setStreetViewAvailable(
          status === window.google.maps.StreetViewStatus.OK
        );
      }
    );
  }, [coordinate, isLoaded]);

  // pan/zoom to a new random coordinate
  function handleNewPlace() {
    const coord = getRandomCoordinate();
    setCoordinate(coord);
    setZoomLevel(5);
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: coord.lat, lng: coord.lon });
    mapRef.current.setZoom(5);
    apply3D(mapRef.current, is3D);

    // smooth zoom up
    let z = 5;
    const iv = setInterval(() => {
      z += 1;
      if (z > 16) return clearInterval(iv);
      mapRef.current.setZoom(z);
      setZoomLevel(z);
    }, 250);
  }

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

      {isLoaded && (
        <div style={containerStyle}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: coordinate.lat, lng: coordinate.lon }}
            zoom={zoomLevel}
            onLoad={onMapLoad}
            options={baseMapOptions}
          >
            {showStreetView && streetViewAvailable ? (
              <StreetViewPanorama
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                visible
                options={{ pov: { heading: 100, pitch: 0 }, zoom: 1 }}
              />
            ) : (
              <Marker
                position={{ lat: coordinate.lat, lng: coordinate.lon }}
                onClick={() => {
                  mapRef.current.panTo({
                    lat: coordinate.lat,
                    lng: coordinate.lon,
                  });
                  mapRef.current.setZoom(17);
                  setZoomLevel(17);
                  apply3D(mapRef.current, is3D);
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
          onClick={() => setShowStreetView((v) => !v)}
          style={btnStyle}
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
