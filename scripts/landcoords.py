import geopandas as gpd
import random
from shapely.geometry import Point
import json

# Read downloaded Natural Earth country shapefile
world = gpd.read_file("ne_110m_admin_0_countries/ne_110m_admin_0_countries.shp")

# Combine all countries into one unified landmass
landmass = world.unary_union

# Get bounding box of the landmass
minx, miny, maxx, maxy = landmass.bounds

# Generate land-only coordinates
points = []
tries = 0
while len(points) < 10000:
    x = random.uniform(minx, maxx)
    y = random.uniform(miny, maxy)
    p = Point(x, y)
    tries += 1
    if landmass.contains(p):
        points.append((y, x))  # (lat, lon)

print(f"Generated {len(points)} land coordinates in {tries} tries.")

# Save to JSON
with open("land_coordinates.json", "w") as f:
    json.dump(points, f)
