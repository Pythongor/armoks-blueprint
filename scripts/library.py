# A dictionary of curated regions
# Format: "key": (latitude, longitude, km_range)
REGIONS = {
    "world": (0, 0, 0),
    "japan": (40, 138.72, 2500),
    "europe": (54.0, 20.0, 4500),
    "alps": (46.5, 10, 700),
    "iceland": (64.9, -18.5, 600),
    "hawaii": (21.0, -157.5, 700),
    "himalayas": (28.0, 84.0, 1200),
    "middleeast": (27.0, 45.0, 4000),
    "australia": (-19.0, 137.0, 9000),
    "carribean": (18.0, -74.0, 3300),
    "north_america": (50.0, -110.0, 8500),
    "south_america": (-20.0, -60.0, 8500),
    "africa": (0.0, 20.0, 9000),
}


def get_region_data(name):
    """Returns (lat, lon, range) if exists, else None."""
    return REGIONS.get(name.lower())
