import os
import math
import argparse
import numpy as np
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from shapely.geometry import box
from scipy.ndimage import zoom

# --- CONFIGURATION ---
OCTANTS = [
    {"n": 90, "s": 0, "w": -180, "e": -90}, {"n": 90, "s": 0, "w": -90, "e": 0},
    {"n": 90, "s": 0, "w": 0, "e": 90},    {
        "n": 90, "s": 0, "w": 90, "e": 180},
    {"n": 0, "s": -90, "w": -180, "e": -90}, {"n": 0, "s": -90, "w": -90, "e": 0},
    {"n": 0, "s": -90, "w": 0, "e": 90},   {"n": 0, "s": -90, "w": 90, "e": 180}
]


def calculate_square_bounds(lat, lon, km_range):
    """Calculates Lon/Lat bounds to ensure a 1:1 physical aspect ratio."""
    # Latitude is constant: ~111.32 km per degree
    lat_step = (km_range / 2) / 111.32

    # Longitude shrinks as we move toward the poles
    # We use the cosine of the latitude to adjust the step
    lon_step = (km_range / 2) / (111.32 * math.cos(math.radians(lat)))

    return (lon - lon_step, lat - lat_step, lon + lon_step, lat + lat_step)


def get_required_files(min_lon, min_lat, max_lon, max_lat):
    required = []
    for oct in OCTANTS:
        if not (max_lon < oct["w"] or min_lon > oct["e"] or
                max_lat < oct["s"] or min_lat > oct["n"]):
            filename = f"gebco_2025_sub_ice_n{float(oct['n'])}_s{float(oct['s'])}_w{float(oct['w'])}_e{float(oct['e'])}.tif"
            file_path = os.path.join("data", "gebco", filename)
            if os.path.exists(file_path):
                required.append(file_path)
    return required


def process_world(bounds, size, title):
    min_lon, min_lat, max_lon, max_lat = bounds
    print(
        f"🌍 Area: Lon({min_lon:.2f} to {max_lon:.2f}), Lat({min_lat:.2f} to {max_lat:.2f})")

    files = get_required_files(min_lon, min_lat, max_lon, max_lat)

    if not files:
        print(
            f"❌ Error: No GEBCO .tif files found in this directory for the requested area.")
        return

    src_files = [rasterio.open(f) for f in files]
    mosaic, out_trans = merge(src_files)

    out_meta = src_files[0].meta.copy()
    out_meta.update(
        {"height": mosaic.shape[1], "width": mosaic.shape[2], "transform": out_trans})

    with rasterio.io.MemoryFile() as memfile:
        with memfile.open(**out_meta) as dataset:
            dataset.write(mosaic)
            # Crop to the calculated bounds
            out_image, _ = mask(
                dataset, [box(min_lon, min_lat, max_lon, max_lat)], crop=True)
            out_image = out_image[0]

    # Inclusive Zoom Fix
    print(f"📐 Resizing to {size}x{size}...")
    resampled = zoom(out_image, (size / out_image.shape[0], size / out_image.shape[1]),
                     order=1, mode='grid-constant', grid_mode=True)

    # Ensure exact size
    resampled = resampled[:size, :size]

    # Three-Segment Normalization
    final = np.zeros_like(resampled, dtype=int)
    final[resampled < 0] = np.interp(
        resampled[resampled < 0], [-11000, 0], [0, 99])
    final[(resampled >= 0) & (resampled < 2000)] = np.interp(
        resampled[(resampled >= 0) & (resampled < 2000)], [0, 2000], [100, 300])
    final[resampled >= 2000] = np.interp(
        resampled[resampled >= 2000], [2000, 8848], [301, 400])

    filename = f"{title.lower().replace(' ', '_')}.txt"
    file_path = os.path.join("output", filename)
    with open(file_path, "w") as f:
        f.write(f"[WORLD_GEN]\n[TITLE:{title}]\n[DIM:{size}]\n")
        for row in final:
            f.write(f"[PS_EL:{':'.join(map(str, row))}]\n")
    print(f"✅ Created {file_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    # Option A: Center + Range
    parser.add_argument("--center", nargs=2, type=float,
                        help="Center Lat and Lon")
    parser.add_argument("--range", type=float,
                        help="Square side length in Kilometers")
    # Option B: Manual Bounds (Fallback)
    parser.add_argument("--lon", nargs=2, type=float)
    parser.add_argument("--lat", nargs=2, type=float)

    parser.add_argument("--size", type=int, default=257)
    parser.add_argument("--title", type=str, default="EXPORTED_REGION")

    args = parser.parse_args()

    if args.center and args.range:
        bounds = calculate_square_bounds(
            args.center[0], args.center[1], args.range)
    elif args.lon and args.lat:
        bounds = (args.lon[0], args.lat[0], args.lon[1], args.lat[1])
    else:
        print("❌ Please provide either --center/--range OR --lon/--lat")
        exit()

    process_world(bounds, args.size, args.title)
