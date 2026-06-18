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


def extract_sub_canvas(bounds, dataset_name="gebco_2026"):
    """Helper to fetch, merge, and crop a standard, non-wrapping bounding box."""
    from geo_utils import get_required_tiff_filenames

    files = [f for f in get_required_tiff_filenames(dataset_name, bounds) if os.path.exists(f)]
    if not files:
        raise FileNotFoundError(f"Missing GEBCO .tif files for the requested area {bounds}.")

    src_files = [rasterio.open(f) for f in files]
    mosaic, out_trans = merge(src_files)

    out_meta = src_files[0].meta.copy()
    out_meta.update({
        "height": mosaic.shape[1], 
        "width": mosaic.shape[2], 
        "transform": out_trans
    })

    with rasterio.io.MemoryFile() as memfile:
        with memfile.open(**out_meta) as dataset:
            dataset.write(mosaic)
            min_lon, min_lat, max_lon, max_lat = bounds
            out_image, _ = mask(dataset, [box(min_lon, min_lat, max_lon, max_lat)], crop=True)
            
    for src in src_files:
        src.close()
        
    return out_image[0]


def extract_elevation_matrix(bounds, target_size):
    """Merges, crops, and resamples elevation data, natively supporting Pacific wrap-around views."""
    min_lon, min_lat, max_lon, max_lat = bounds

    # Check if the requested bounds cross the International Date Line / wrap around
    if min_lon < -180:
        # LEFT HALF OF CANVAS: Asia / Australia (mapped from the far right of the flat world grid)
        left_bounds = (min_lon + 360, min_lat, 180, max_lat)
        left_matrix = extract_sub_canvas(left_bounds)

        # RIGHT HALF OF CANVAS: Americas / Atlantic (mapped from the left of the flat world grid)
        right_bounds = (-180, min_lat, max_lon, max_lat)
        right_matrix = extract_sub_canvas(right_bounds)

        # Glue them together horizontally (hstack) to form a seamless Pacific center
        out_image = np.hstack((left_matrix, right_matrix))

    elif max_lon > 180:
        # Handling the reverse wrapping case just in case
        left_bounds = (min_lon, min_lat, 180.0, max_lat)
        left_matrix = extract_sub_canvas(left_bounds)

        right_bounds = (-180.0, min_lat, max_lon - 360, max_lat)
        right_matrix = extract_sub_canvas(right_bounds)

        out_image = np.hstack((left_matrix, right_matrix))

    else:
        # Standard non-wrapping map (Europe/Atlantic centered or standard regional presets)
        out_image = extract_sub_canvas(bounds)

    # Resample the combined seamless canvas to your exact target size
    resampled = zoom(
        out_image, 
        (target_size / out_image.shape[0], target_size / out_image.shape[1]),
        order=1, 
        mode='grid-constant', 
        grid_mode=True
    )

    return resampled[:target_size, :target_size]


def extract_layer_from_single_tif(bounds, target_size, tif_path):
    """Reads a specific area from a single global TIFF (Temp/Rain), handling antimeridian wrap."""
    min_lon, min_lat, max_lon, max_lat = bounds
    
    with rasterio.open(tif_path) as src:
        if min_lon < -180:
            # LEFT HALF OF CANVAS: Asia / Australia (Shifted into standard [10, 180] space)
            left_bounds = (min_lon + 360, min_lat, 180.0, max_lat)
            left_window = from_bounds(*left_bounds, transform=src.transform)
            left_data = src.read(1, window=left_window, boundless=True, fill_value=-9999)
            
            # RIGHT HALF OF CANVAS: Americas / Atlantic (Standard [-180, 10] space)
            right_bounds = (-180.0, min_lat, max_lon, max_lat)
            right_window = from_bounds(*right_bounds, transform=src.transform)
            right_data = src.read(1, window=right_window, boundless=True, fill_value=-9999)
            
            data = np.hstack((left_data, right_data))
            
        elif max_lon > 180:
            # Left Half of canvas
            left_bounds = (min_lon, min_lat, 180.0, max_lat)
            left_window = from_bounds(*left_bounds, transform=src.transform)
            left_data = src.read(1, window=left_window, boundless=True, fill_value=-9999)
            
            # Right Half of canvas
            right_bounds = (-180.0, min_lat, max_lon - 360, max_lat)
            right_window = from_bounds(*right_bounds, transform=src.transform)
            right_data = src.read(1, window=right_window, boundless=True, fill_value=-9999)
            
            data = np.hstack((left_data, right_data))
        else:
            # Standard map within flat [-180, 180] limits
            window = from_bounds(*bounds, transform=src.transform)
            data = src.read(1, window=window, boundless=True, fill_value=-9999)

    # Resample compiled data matrix to your exact canvas size
    h, w = data.shape
    resampled = zoom(data, (target_size / h, target_size / w),
                     order=1, mode='grid-constant', grid_mode=True)

    return resampled[:target_size, :target_size]


def extract_volcano_coords(bounds, target_size, file_path, km_range=1000):
    """
    Extracts and maps volcano positions into pixel space, automatically tracking 
    features wrapping across the International Date Line canvas bounds.
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

        if min_lat <= lat <= max_lat:
            # Check standard placement, shifted-left, and shifted-right tracking paths
            # This covers regular layout or world-wrapped spans smoothly.
            for shift in [0, -360, 360]:
                adjusted_lon = lon + shift
                
                if min_lon <= adjusted_lon <= max_lon:
                    # Project adjusted location to our seamless local display viewport
                    x = int(np.interp(adjusted_lon, [min_lon, max_lon], [0, target_size - 1]))
                    y = int(np.interp(lat, [min_lat, max_lat], [target_size - 1, 0]))
                    
                    points.append((x, y, dynamic_radius))
                    break

    return points
