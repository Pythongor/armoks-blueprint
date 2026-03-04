from scipy.ndimage import laplace, generic_filter
import numpy as np

GLOBAL_TEMPERATURE_MIN = -54.5
GLOBAL_TEMPERATURE_MAX = 29.7


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


def normalize_to_df_elevation(matrix):
    final = np.zeros_like(matrix, dtype=int)
    ocean = matrix < 0
    final[ocean] = np.interp(matrix[ocean], [-11000, 0], [0, 99])
    low_land = (matrix >= 0) & (matrix < 2000)
    final[low_land] = np.interp(matrix[low_land], [0, 2000], [100, 300])
    high_land = matrix >= 2000
    final[high_land] = np.interp(matrix[high_land], [2000, 8848], [301, 400])
    return final


def normalize_to_df_temperature(tm_matrix, el_matrix):
    # 1. Clean the 'NoData' spikes before they hit the math
    tm_clean = clean_coastal_noise(tm_matrix, invalid_val=-1000)

    final = np.zeros_like(tm_clean, dtype=int)
    land_mask = el_matrix >= 100
    ocean_mask = el_matrix < 100

    # --- LAND PROCESSING ---
    if np.any(land_mask):
        land_raw = tm_clean[land_mask]

        # Linear map to 0.0 - 1.0 based on GLOBAL constants
        # Anything colder than -54.5 becomes 0, hotter than 29.7 becomes 1.0
        norm = (land_raw - GLOBAL_TEMPERATURE_MIN) / \
            (GLOBAL_TEMPERATURE_MAX - GLOBAL_TEMPERATURE_MIN)
        norm = np.clip(norm, 0, 1)

        # Apply Easing
        # We want the 'Temperate' zone (0°C to 20°C) to be the most detailed.
        # A power of 2.2 works well for global absolute scales.
        eased = np.power(norm, 2.2)

        final[land_mask] = (eased * 100).astype(int)

    # --- OCEAN PROCESSING ---
    if np.any(ocean_mask):
        ocean_raw = tm_clean[ocean_mask]
        norm_o = (ocean_raw - GLOBAL_TEMPERATURE_MIN) / \
            (GLOBAL_TEMPERATURE_MAX - GLOBAL_TEMPERATURE_MIN)
        norm_o = np.clip(norm_o, 0, 1)

        # Oceans move in a tighter, more moderate range (20 to 70)
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


def normalize_to_df_savagery(pop_matrix, el_matrix):
    # 1. Clean Data
    pop_clean = np.where(pop_matrix < 0, 0, pop_matrix)

    # 2. Logarithmic Scaling
    pop_log = np.log1p(pop_clean)

    # 3. ADJUSTED THRESHOLD (The 'Taming' Factor)
    # Areas with even 50 people/km2 are considered mostly civilized.
    # This reduces the 'Max Savagery' bloat in rural/low-density areas.
    max_log_val = np.log1p(50)

    # 4. Interpolate Inversely
    # 0 pop -> 100 Savagery
    # 50+ pop -> 0 Savagery
    savagery = np.interp(pop_log, [0, max_log_val], [100, 0])

    # 5. Apply "Softening" (Power Curve)
    # Applying a power of 0.7 pushes values DOWN towards the 'Civilized' end.
    # This makes 'Savagery 100' much harder to reach (only for total void).
    savagery = np.power(savagery / 100.0, 1.2) * 100

    # 6. OCEAN LOGIC (The Neutral 50)
    ocean_mask = el_matrix < 0
    savagery[ocean_mask] = 50

    return np.clip(savagery, 0, 100).astype(int)


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


def format_as_world_gen(el, tm, rn, dr, vo, sv, title, size):
    lines = ["[WORLD_GEN]", f"[TITLE:{title}]", f"[DIM:{size}]"]

    def add_layer(tag, matrix):
        for row in matrix:
            lines.append(f"[{tag}:{':'.join(map(str, row))}]")
    add_layer("PS_EL", el)
    add_layer("PS_TM", tm)
    add_layer("PS_RF", rn)
    add_layer("PS_DR", dr)
    add_layer("PS_VL", vo)
    add_layer("PS_SV", sv)

    return "\n".join(lines)
