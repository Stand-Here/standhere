#!/usr/bin/env python3
import os
import json
import random
import time
import requests

# config
LAND_COORDS_PATH  = "scripts/land_coordinates.json"
OUTPUT_PATH       = "scripts/roads_coords.json"
BATCH_SIZE        = 100      # max per Roads API request
TARGET_SAMPLES    = 1000     # how many snapped points you want
API_KEY           = "AIzaSyBX8UM3Qjw2kU0QaqcbZEy4eJxvce-Diz0"
NEAREST_ROADS_URL = "https://roads.googleapis.com/v1/nearestRoads"

if not API_KEY:
    raise RuntimeError("Set GOOGLE_MAPS_API_KEY")

# load your land‐only coords
with open(LAND_COORDS_PATH) as f:
    land_points = json.load(f)  # expect [[lat, lng], ...]

def sample_points(n):
    """randomly sample n points from land_points"""
    return random.sample(land_points, n)

def batch(iterable, n):
    """yield successive n‐sized chunks from iterable"""
    for i in range(0, len(iterable), n):
        yield iterable[i : i + n]

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
    # each entry has “location”: {lat, longitude}
    return [(p["location"]["latitude"], p["location"]["longitude"]) for p in data]

def main():
    snapped = []
    attempts = 0
    # keep feeding random batches until we accumulate TARGET_SAMPLES
    while len(snapped) < TARGET_SAMPLES:
        attempts += 1
        pts = sample_points(BATCH_SIZE)
        try:
            new = snap_batch(pts)
        except Exception as e:
            print("API error:", e)
            time.sleep(1)
            continue

        snapped.extend(new)
        print(f"Batch {attempts}: requested {len(pts)}, snapped {len(new)}; total={len(snapped)}")
        time.sleep(0.1)  # small delay to ease rate‐limit pressure

    # truncate to EXACTLY what we need
    snapped = snapped[:TARGET_SAMPLES]

    # write out as JSON list of {lat,lng}
    with open(OUTPUT_PATH, "w") as f:
        json.dump([{"lat": lat, "lng": lng} for lat, lng in snapped], f, indent=2)

    print(f"Saved {len(snapped)} snapped road coords to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
