from scipy.ndimage import laplace, generic_filter
import numpy as np


def clean_coastal_noise(matrix, invalid_val=-1000):
    """
    Finds pixels with 'NoData' and replaces them with the average of 
    their neighbors so they don't spike the normalization.
    """
    bad_mask = matrix <= invalid_val
    if not np.any(bad_mask):
        return matrix

    # Simple 3x3 mean filter to fill holes on the coastline
    def fill_void(values):
        v = values[values > invalid_val]
        return np.mean(v) if v.size > 0 else 0

    return generic_filter(matrix, fill_void, size=3)


def normalize_to_df_temperature(tm_matrix, el_matrix):
    # 1. Clean the 'NoData' spikes before they hit the math
    tm_clean = clean_coastal_noise(tm_matrix, invalid_val=-1000)

    final = np.zeros_like(tm_clean, dtype=int)
    land_mask = el_matrix >= 100
    ocean_mask = el_matrix < 100

    if np.any(land_mask):
        land_raw = tm_clean[land_mask]
        l_min, l_max = land_raw.min(), land_raw.max()
        print(f"🌡️  Land: {l_min:.1f}°C to {l_max:.1f}°C")

        norm = (land_raw - l_min) / (l_max - l_min)
        eased = np.power(norm, 2.2)
        final[land_mask] = (eased * 100).astype(int)

    if np.any(ocean_mask):
        ocean_raw = tm_clean[ocean_mask]
        norm_o = (ocean_raw - ocean_raw.min()) / \
            (ocean_raw.max() - ocean_raw.min() + 1)
        final[ocean_mask] = (norm_o * 50 + 20).astype(int)

    return np.clip(final, 0, 100).astype(int)


def normalize_to_df_rainfall(matrix):
    """WorldClim Rain is mm/year. Map 0..3000mm to 0..100."""
    # 0mm -> 0 (Desert)
    # 3000mm+ -> 100 (Rainforest or Swamp)
    return np.interp(matrix, [0, 3000], [0, 100]).astype(int)


def calculate_drainage_advanced(raw_el, raw_tm, raw_rn):
    # Clean inputs so they don't break the slope/climate balance
    tm_c = clean_coastal_noise(raw_tm, invalid_val=-1000)
    rn_c = clean_coastal_noise(raw_rn, invalid_val=-1)

    # 1. Slope (Topography)
    slope_raw = np.abs(laplace(raw_el.astype(float)))
    land_mask = raw_el >= 0

    l_slope = slope_raw[land_mask]
    l_slope_log = np.log1p(l_slope)

    # Clip only the top 0.5% to stop coastal cliffs from ruining the scale
    p1, p99_5 = np.percentile(l_slope_log, [0.5, 99.5])
    slope_norm = np.interp(l_slope_log, [p1, p99_5], [10, 80])

    # 2. Climate balance
    l_tm = tm_c[land_mask] / 10.0
    l_rn = rn_c[land_mask]
    climate_factor = (l_tm * 1.5) - (l_rn / 40.0)

    combined = slope_norm + climate_factor

    final = np.full(raw_el.shape, 50, dtype=int)
    final[land_mask] = np.interp(
        combined, [combined.min(), combined.max()], [0, 100])

    return final.astype(int)


def normalize_to_df_elevation(matrix):
    final = np.zeros_like(matrix, dtype=int)
    ocean = matrix < 0
    final[ocean] = np.interp(matrix[ocean], [-11000, 0], [0, 99])
    low_land = (matrix >= 0) & (matrix < 2000)
    final[low_land] = np.interp(matrix[low_land], [0, 2000], [100, 300])
    high_land = matrix >= 2000
    final[high_land] = np.interp(matrix[high_land], [2000, 8848], [301, 400])
    return final


def generate_volcano_layer(volcano_info, size):
    matrix = np.zeros((size, size), dtype=int)

    for x, y, radius in volcano_info:
        # If radius is small (world map), just plot the point
        if radius <= 1:
            if 0 <= x < size and 0 <= y < size:
                matrix[y, x] = 100
            continue

        # If radius is large (local map), create the gradient
        for i in range(-radius, radius + 1):
            for j in range(-radius, radius + 1):
                nx, ny = x + i, y + j
                if 0 <= nx < size and 0 <= ny < size:
                    dist = np.sqrt(i**2 + j**2)
                    if dist <= radius:
                        # Smooth falloff from 100 to 80
                        val = int(100 - (dist / radius) * 20)
                        if val > matrix[ny, nx]:
                            matrix[ny, nx] = val
    return matrix


def format_as_world_gen(el, tm, rn, dr, vo, title, size):
    lines = ["[WORLD_GEN]", f"[TITLE:{title}]", f"[DIM:{size}]"]

    def add_layer(tag, matrix):
        for row in matrix:
            lines.append(f"[{tag}:{':'.join(map(str, row))}]")
    add_layer("PS_EL", el)
    add_layer("PS_TM", tm)
    add_layer("PS_RF", rn)
    add_layer("PS_DR", dr)
    add_layer("PS_VL", vo)

    return "\n".join(lines)
