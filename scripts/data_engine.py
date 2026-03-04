import json
import os
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from shapely.geometry import box
from scipy.ndimage import zoom
from rasterio.windows import from_bounds
import numpy as np


def extract_layer_matrix(bounds, target_size, tif_path):
    """Generalized function to crop and resample ANY GeoTIFF."""
    with rasterio.open(tif_path) as src:
        bbox_poly = [box(*bounds)]
        out_image, _ = mask(src, bbox_poly, crop=True)
        out_image = out_image[0]

    resampled = zoom(out_image, (target_size / out_image.shape[0], target_size / out_image.shape[1]),
                     order=1, mode='grid-constant', grid_mode=True)

    return resampled[:target_size, :target_size]


def extract_elevation_matrix(bounds, target_size):
    """Merges, crops, and resamples elevation data."""
    from geo_utils import get_required_tiff_filenames

    files = [f for f in get_required_tiff_filenames(
        bounds) if os.path.exists(f)]
    if not files:
        raise FileNotFoundError(
            "Missing GEBCO .tif files for the requested area.")

    src_files = [rasterio.open(f) for f in files]
    mosaic, out_trans = merge(src_files)

    out_meta = src_files[0].meta.copy()
    out_meta.update(
        {"height": mosaic.shape[1], "width": mosaic.shape[2], "transform": out_trans})

    with rasterio.io.MemoryFile() as memfile:
        with memfile.open(**out_meta) as dataset:
            dataset.write(mosaic)
            min_lon, min_lat, max_lon, max_lat = bounds
            out_image, _ = mask(
                dataset, [box(min_lon, min_lat, max_lon, max_lat)], crop=True)
            out_image = out_image[0]

    # Resample to exact target size
    resampled = zoom(out_image, (target_size / out_image.shape[0], target_size / out_image.shape[1]),
                     order=1, mode='grid-constant', grid_mode=True)

    return resampled[:target_size, :target_size]


def extract_layer_from_single_tif(bounds, target_size, tif_path):
    """Reads a specific area from a single global TIFF (Temp/Rain)."""
    with rasterio.open(tif_path) as src:
        # 1. Define the window based on your Lat/Lon bounds
        window = from_bounds(*bounds, transform=src.transform)

        # 2. Read only that window (Band 1)
        # boundless=True prevents errors if your box slightly crosses the map edge
        data = src.read(1, window=window, boundless=True, fill_value=-9999)

    # 3. Resample to your target size (e.g., 257)
    from scipy.ndimage import zoom
    h, w = data.shape
    resampled = zoom(data, (target_size / h, target_size / w),
                     order=1, mode='grid-constant', grid_mode=True)

    return resampled[:target_size, :target_size]


def extract_volcano_coords(bounds, target_size, file_path, km_range=1000):
    """
    Now returns (x, y, radius) where radius is scaled to the map zoom.
    """
    min_lon, min_lat, max_lon, max_lat = bounds

    # Calculate how many pixels are in 1 KM
    # Total range in KM is km_range * 2 (since it's a radius from center)
    pixels_per_km = target_size / (km_range * 2)

    # Define a standard volcano 'footprint' in KM (e.g., 4km radius)
    # On a world map (km_range=20000), this will be 0.05 pixels.
    # On a local map (km_range=10), this will be 51 pixels.
    dynamic_radius = max(1, int(4 * pixels_per_km))

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    points = []
    for feature in data['features']:
        coords = feature['geometry']['coordinates']
        lon, lat = coords[0], coords[1]

        if (min_lat <= lat <= max_lat) and (min_lon <= lon <= max_lon):
            x = int(np.interp(lon, [min_lon, max_lon], [0, target_size - 1]))
            y = int(np.interp(lat, [min_lat, max_lat], [target_size - 1, 0]))

            # Store radius with the coordinate
            points.append((x, y, dynamic_radius))

    return points
