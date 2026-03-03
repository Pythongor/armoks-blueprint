import os
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from shapely.geometry import box
from scipy.ndimage import zoom
from rasterio.windows import from_bounds


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
