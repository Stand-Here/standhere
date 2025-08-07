#!/usr/bin/env python3
import os
import json
import random
import time
import requests
from dotenv import load_dotenv
import os

# Specify the path to your env file inside src/
load_dotenv(dotenv_path=".env")

API_KEY = os.getenv("VITE_MAPS_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GOOGLE_MAPS_API_KEY environment variable")


# === Configuration ===
LAND_COORDS_PATH = "scripts\land_coordinates.json"
OUTPUT_PATH = "scripts\roads_coords.json"
BATCH_SIZE = 100           # Max points per Nearest Roads API request
NEW_POINTS_TO_ADD = 150    # How many new valid coords to add

# Get API key from environment variable
API_KEY = os.getenv("VITE_MAPS_API_KEY")

# === Safety check ===
if not API_KEY or "AIza" not in API_KEY:
    raise RuntimeError("❌ Google Maps API key is missing or invalid. Please set GOOGLE_MAPS_API_KEY in your .env file.")

NEAREST_ROADS_URL = "https://roads.googleapis.com/v1/nearestRoads"
STREET_VIEW_META_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

# === Load land-only coordinates ===
with open(LAND_COORDS_PATH, "r") as f:
    land_points = json.load(f)

# === Load existing road coordinates with Street View ===
existing_coords = []
if os.path.exists(OUTPUT_PATH):
    try:
        with open(OUTPUT_PATH, "r") as f:
            existing_coords = json.load(f)
    except (json.JSONDecodeError, ValueError):
        print("⚠️ roads_coords.json is invalid or empty. Starting fresh.")

seen_coords = set((round(p["lat"], 7), round(p["lng"], 7)) for p in existing_coords)
print(f"📦 Loaded {len(existing_coords)} existing road coordinates with Street View.")

# === Helper Functions ===

def sample_points(n):
    """Randomly sample n land coordinates."""
    return random.sample(land_points, n)

def snap_batch(batch_points):
    """Snap points to nearest roads using Google Roads API."""
    path = "|".join(f"{lat},{lng}" for lat, lng in batch_points)
    params = {"points": path, "key": API_KEY}
    resp = requests.get(NEAREST_ROADS_URL, params=params)
    resp.raise_for_status()
    data = resp.json().get("snappedPoints", [])
    return [(p["location"]["latitude"], p["location"]["longitude"]) for p in data]

def has_street_view(lat, lng):
    """Check if Street View is available near given coordinates."""
    params = {
        "location": f"{lat},{lng}",
        "radius": 50,
        "key": API_KEY,
    }
    try:
        resp = requests.get(STREET_VIEW_META_URL, params=params)
        resp.raise_for_status()
        return resp.json().get("status") == "OK"
    except Exception as e:
        print("Street View check failed:", e)
        return False

# === Main Process ===
snapped_with_street_view = existing_coords.copy()
new_coords_collected = 0
attempts = 0

while new_coords_collected < NEW_POINTS_TO_ADD:
    attempts += 1
    pts = sample_points(BATCH_SIZE)

    try:
        snapped = snap_batch(pts)
    except Exception as e:
        print(f"🚫 Roads API error on batch {attempts}: {e}")
        time.sleep(1)
        continue

    unique_snapped = list(set(snapped))

    for lat, lng in unique_snapped:
        coord_key = (round(lat, 7), round(lng, 7))
        if coord_key in seen_coords:
            continue

        seen_coords.add(coord_key)

        if has_street_view(lat, lng):
            snapped_with_street_view.append({"lat": lat, "lng": lng})
            new_coords_collected += 1
            print(f"✅ {new_coords_collected}/{NEW_POINTS_TO_ADD} Street View at {lat:.6f}, {lng:.6f}")
        else:
            print(f"✗ No Street View at {lat:.6f}, {lng:.6f}")

        time.sleep(0.05)  # avoid hitting API rate limits

        if new_coords_collected >= NEW_POINTS_TO_ADD:
            break

    print(f"📊 Batch {attempts} done: {new_coords_collected} new added so far")

# === Save updated coordinate list ===
with open(OUTPUT_PATH, "w") as f:
    json.dump(snapped_with_street_view, f, indent=2)

print(f"\n🎉 Done! Appended {NEW_POINTS_TO_ADD} new Street View coords.")
print(f"📍 Total unique coords saved: {len(snapped_with_street_view)} to {OUTPUT_PATH}")
