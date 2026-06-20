import math
import os

def get_antimeridian_segments(bounds):
    """
    Checks if a bounding box crosses the antimeridian seam (-180/180).
    Returns a tuple of (is_wrapped, left_bounds, right_bounds).
    """
    min_lon, min_lat, max_lon, max_lat = bounds
    
    # Seam cross on the western hemisphere boundary (-180)
    if min_lon < -180 and max_lon > -180:
        left = (min_lon + 360, min_lat, 180.0, max_lat)
        right = (-180.0, min_lat, max_lon, max_lat)
        return True, left, right
        
    # Seam cross on the eastern hemisphere boundary (180)
    elif max_lon > 180 and min_lon < 180:
        left = (min_lon, min_lat, 180.0, max_lat)
        right = (-180.0, min_lat, max_lon - 360, max_lat)
        return True, left, right
        
    return False, bounds, None


def calculate_square_bounds(lat, lon, km_range):
    """Calculates Lon/Lat bounds to ensure a 1:1 physical aspect ratio."""
    # Latitude is constant: ~111.32 km per degree
    lat_step = (km_range / 2) / 111.32

    # Longitude shrinks as we move toward the poles
    # Adjust step by the cosine of the latitude
    lon_step = (km_range / 2) / (111.32 * math.cos(math.radians(lat)))

    return (lon - lon_step, lat - lat_step, lon + lon_step, lat + lat_step)


def get_required_tiff_filenames(dataset, bounds):
    """Determines which GEBCO octants are needed based on bounds."""
    min_lon, min_lat, max_lon, max_lat = bounds
    octants = [
        {"n": 90, "s": 0, "w": -180, "e": -90}, {"n": 90, "s": 0, "w": -90, "e": 0},
        {"n": 90, "s": 0, "w": 0, "e": 90},    {"n": 90, "s": 0, "w": 90, "e": 180},
        {"n": 0, "s": -90, "w": -180, "e": -90}, {"n": 0, "s": -90, "w": -90, "e": 0},
        {"n": 0, "s": -90, "w": 0, "e": 90},   {"n": 0, "s": -90, "w": 90, "e": 180}
    ]

    suffix = "_geotiff" if "2026" in dataset else ""

    required = []
    for oct in octants:
        if not (max_lon < oct["w"] or min_lon > oct["e"] or
                max_lat < oct["s"] or min_lat > oct["n"]):
            
            filename = f"{dataset}_n{float(oct['n'])}_s{float(oct['s'])}_w{float(oct['w'])}_e{float(oct['e'])}{suffix}.tif"
            file_path = os.path.join("data", "gebco", dataset, filename)
            required.append(file_path)
            
    return required
