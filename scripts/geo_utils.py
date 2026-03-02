import math
import os


def calculate_square_bounds(lat, lon, km_range):
    """Calculates Lon/Lat bounds to ensure a 1:1 physical aspect ratio."""
    # Latitude is constant: ~111.32 km per degree
    lat_step = (km_range / 2) / 111.32

    # Longitude shrinks as we move toward the poles
    # Adjust step by the cosine of the latitude
    lon_step = (km_range / 2) / (111.32 * math.cos(math.radians(lat)))

    return (lon - lon_step, lat - lat_step, lon + lon_step, lat + lat_step)


def get_required_tiff_filenames(bounds):
    """Determines which GEBCO octants are needed based on bounds."""
    min_lon, min_lat, max_lon, max_lat = bounds
    octants = [
        {"n": 90, "s": 0, "w": -180, "e": -90}, {"n": 90, "s": 0, "w": -90, "e": 0},
        {"n": 90, "s": 0, "w": 0, "e": 90},    {
            "n": 90, "s": 0, "w": 90, "e": 180},
        {"n": 0, "s": -90, "w": -180, "e": -
            90}, {"n": 0, "s": -90, "w": -90, "e": 0},
        {"n": 0, "s": -90, "w": 0, "e": 90},   {"n": 0, "s": -90, "w": 90, "e": 180}
    ]

    required = []
    for oct in octants:
        if not (max_lon < oct["w"] or min_lon > oct["e"] or
                max_lat < oct["s"] or min_lat > oct["n"]):
            filename = f"gebco_2025_sub_ice_n{float(oct['n'])}_s{float(oct['s'])}_w{float(oct['w'])}_e{float(oct['e'])}.tif"
            file_path = os.path.join("data", "gebco", filename)
            required.append(file_path)
    return required
