#!/usr/bin/env python3
import os
import json
import random
import time
import requests

# config
LAND_COORDS_PATH = "scripts/land_coordinates.json"
OUTPUT_PATH = "scripts/roads_coords.json"
BATCH_SIZE = 100        # max per Roads API request
TARGET_SAMPLES = 300   # how many snapped points you want
API_KEY = "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0"
NEAREST_ROADS_URL = "https://roads.googleapis.com/v1/nearestRoads"
STREET_VIEW_META_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

if not API_KEY:
    raise RuntimeError("Set GOOGLE_MAPS_API_KEY")

# load your land‐only coords
with open(LAND_COORDS_PATH) as f:
    land_points = json.load(f)  # expect [[lat, lng], ...]

def sample_points(n):
    """randomly sample n points from land_points"""
    return random.sample(land_points, n)



def snap_batch(batch_points):
    """call Nearest Roads API on up to 100 pts; returns list of snapped points"""
    path = "|".join(f"{lat},{lng}" for lat, lng in batch_points)
    params = {
        "points": path,
        "key": API_KEY,
    }
    resp = requests.get(NEAREST_ROADS_URL, params=params)
    resp.raise_for_status()
    data = resp.json().get("snappedPoints", [])
    return [(p["location"]["latitude"], p["location"]["longitude"]) for p in data]

def has_street_view(lat, lng):
    """Check if Street View is available at given coordinates"""
    params = {
        "location": f"{lat},{lng}",
        "radius": 50,
        "key": API_KEY,
    }
    try:
        resp = requests.get(STREET_VIEW_META_URL, params=params)
        resp.raise_for_status()
        data = resp.json()
        return data.get("status") == "OK"
    except Exception as e:
        print("Street View check failed:", e)
        return False

def main():
    snapped_with_street_view = []
    seen_coords = set()
    attempts = 0

    while len(snapped_with_street_view) < TARGET_SAMPLES:
        attempts += 1
        pts = sample_points(BATCH_SIZE)

        try:
            snapped = snap_batch(pts)
        except Exception as e:
            print("Roads API error:", e)
            time.sleep(1)
            continue

        # Remove duplicates from this batch using a set
        unique_snapped = list(set(snapped))

        valid_coords = []
        for lat, lng in unique_snapped:
            coord_key = (round(lat, 7), round(lng, 7))  # rounded for float comparison stability
            if coord_key in seen_coords:
                continue  # skip if we've already seen this coord

            seen_coords.add(coord_key)

            if has_street_view(lat, lng):
                valid_coords.append((lat, lng))
                print(f"✓ Street View found at {lat}, {lng}")
            else:
                print(f"✗ No Street View at {lat}, {lng}")

            time.sleep(0.05)  # to ease rate limiting

        snapped_with_street_view.extend(valid_coords)
        print(f"Batch {attempts}: {len(valid_coords)} valid, total={len(snapped_with_street_view)}")

    # Truncate to target
    snapped_with_street_view = snapped_with_street_view[:TARGET_SAMPLES]

    with open(OUTPUT_PATH, "w") as f:
        json.dump([{"lat": lat, "lng": lng} for lat, lng in snapped_with_street_view], f, indent=2)

    print(f"\n✅ Saved {len(snapped_with_street_view)} valid road coords with Street View to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
