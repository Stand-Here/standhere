import geopandas as gpd
import random
from shapely.geometry import Point
import json
import os

# === Configuration ===
LAND_JSON_PATH = "land_coordinates.json"
TARGET_NEW_POINTS = 100_000  # How many new unique land coords to add

# === Load world landmass shapefile ===
world = gpd.read_file("ne_110m_admin_0_countries/ne_110m_admin_0_countries.shp")
landmass = world.unary_union
minx, miny, maxx, maxy = landmass.bounds

# === Load existing coordinates from file ===
existing_points = set()
if os.path.exists(LAND_JSON_PATH):
    with open(LAND_JSON_PATH, "r") as f:
        try:
            loaded = json.load(f)
            existing_points = set(tuple(coord) for coord in loaded)
        except Exception as e:
            print("⚠️ Failed to load existing coordinates:", e)

print(f"Loaded {len(existing_points)} existing land coordinates.")

# === Generate new unique land-only coordinates ===
new_points = []
tries = 0

while len(new_points) < TARGET_NEW_POINTS:
    x = random.uniform(minx, maxx)
    y = random.uniform(miny, maxy)
    p = Point(x, y)
    tries += 1
    latlon = (y, x)

    if landmass.contains(p) and latlon not in existing_points:
        new_points.append(latlon)
        existing_points.add(latlon)

print(f"✅ Generated {len(new_points)} new unique land coordinates in {tries} tries.")
print(f"🌍 Total unique land coordinates after merge: {len(existing_points)}")

# === Save all combined coordinates back to file ===
with open(LAND_JSON_PATH, "w") as f:
    json.dump(list(existing_points), f)
