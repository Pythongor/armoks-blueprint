import os
import rasterio
from rasterio.merge import merge
from rasterio.mask import mask
from shapely.geometry import box
from scipy.ndimage import zoom
import numpy as np


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
