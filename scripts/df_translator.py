import json
import os

from scipy.ndimage import laplace, generic_filter, distance_transform_edt, gaussian_filter
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


def normalize_to_df_temperature(tm_matrix, el_matrix, bounds, blend_radius=8, noise_seed=42):
    """
    Normalizes temperatures into Dwarf Fortress scales (-50 to 120), smoothly
    extrapolating coastal land temperatures into shallow water tiles to prevent
    artificial thermal drops along the shoreline.
    """
    min_lon, min_lat, max_lon, max_lat = bounds
    H, W = tm_matrix.shape

    # 1. Clean standard edge noise anomalies
    tm_clean = clean_coastal_noise(tm_matrix, invalid_val=-1000)

    # 2. Set up our geospatial land mask
    land_mask = el_matrix >= 100

    # 3. THERMAL DIFFUSION (Extrapolate landward temperatures out to sea)
    # Isolate landmass thermal values and fill the ocean spaces with zeros
    land_only_tm = np.where(land_mask, tm_clean, 0.0)
    
    # Smoothly blur both the mask and the values to create a fallback blend map
    mask_blur = gaussian_filter(land_mask.astype(float), sigma=max(1, blend_radius / 2))
    tm_blur = gaussian_filter(land_only_tm, sigma=max(1, blend_radius / 2))
    
    # Divide blurred values by blurred weights to extend true coastal trends outward
    land_extended_tm = np.where(mask_blur > 1e-5, tm_blur / np.maximum(mask_blur, 1e-5), tm_clean)

    # 4. GENERATE PLANETARY CURRENT GRADIENTS (Domain Warped Cosine Field)
    rng = np.random.default_rng(noise_seed)
    raw_noise = rng.normal(0, 1, size=(H, W))
    current_noise = gaussian_filter(raw_noise, sigma=max(4, H / 12))
    current_noise = (current_noise - current_noise.min()) / (current_noise.max() - current_noise.min()) * 2.0 - 1.0

    lats_base = np.linspace(max_lat, min_lat, H)
    lats_grid = np.repeat(lats_base[:, np.newaxis], W, axis=1)

    latitude_warp_amplitude = 12.0
    warped_lats = lats_grid + (current_noise * latitude_warp_amplitude)
    warped_lats = np.clip(warped_lats, -90, 90)

    ocean_synthetic = GLOBAL_TEMPERATURE_MIN + np.cos(np.radians(warped_lats)) * (GLOBAL_TEMPERATURE_MAX - GLOBAL_TEMPERATURE_MIN)
    ocean_synthetic += current_noise * 4.0

    # 5. REVOLUTIONIZED MARITIME BLENDING
    dist_to_land = distance_transform_edt(~land_mask)
    ocean_blend_weight = np.clip(dist_to_land / blend_radius, 0, 1)

    tm_final = tm_clean.copy()
    
    # MAGIC SHIFT: Instead of blending raw ocean data, we blend our organic 
    # extended coastal data with the deep-sea current model!
    tm_final[~land_mask] = (
        (1.0 - ocean_blend_weight[~land_mask]) * land_extended_tm[~land_mask] + 
        ocean_blend_weight[~land_mask] * ocean_synthetic[~land_mask]
    )

    # 6. VARIABLE EXPONENT MATRIX (Maintains the seamless power easing curve)
    dist_to_ocean = distance_transform_edt(land_mask)
    weight_matrix = np.zeros_like(el_matrix, dtype=float)
    weight_matrix[land_mask] = 0.5 + 0.5 * np.clip(dist_to_ocean[land_mask] / blend_radius, 0, 1)
    weight_matrix[~land_mask] = 0.5 * (1.0 - np.clip(dist_to_land[~land_mask] / blend_radius, 0, 1))
    
    easing_powers = 1.5 + (2.2 - 1.5) * weight_matrix

    # 7. UNIFIED MATRIX PARSING RUN
    norm = (tm_final - GLOBAL_TEMPERATURE_MIN) / (GLOBAL_TEMPERATURE_MAX - GLOBAL_TEMPERATURE_MIN)
    norm = np.clip(norm, 0, 1)
    eased = np.power(norm, easing_powers)

    final = (eased * 170 - 50).astype(int)

    return np.clip(final, -50, 120).astype(int)


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


def format_as_world_gen(el, tm, rn, dr, vo, sv, title, size, config_path="scripts/config.json"):
    # 1. Load the flattened config from the JSON file
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            full_config = json.load(f)
            # Accessing the DEFAULT_CONFIG or the flattened dict directly
            config_dict = full_config.get("DEFAULT_CONFIG", full_config)
    else:
        print(f"⚠️ Config not found at {config_path}, using empty defaults.")
        config_dict = {}

    lines = ["[WORLD_GEN]", f"[TITLE:{title}]", f"[DIM:{size}]"]

    # 2. Iterate through the flattened dictionary
    for key, val in config_dict.items():
        # Skip DIM as we set it dynamically above
        if key == "DIM":
            continue

        # Handle REGION_COUNTS (List of Lists)
        if key == "REGION_COUNTS" and isinstance(val, list):
            for region_data in val:
                lines.append(
                    f"[REGION_COUNTS:{':'.join(map(str, region_data))}]")

        # Handle Standard flattened parameters
        elif isinstance(val, list):
            lines.append(f"[{key}:{':'.join(map(str, val))}]")
        else:
            lines.append(f"[{key}:{val}]")

    # 3. Add the Raw Data Layers (PS Tags)
    # Note: PS_RF (Rainfall) and PS_VL (Volcanism) used based on your recent tags
    def add_layer(tag, matrix):
        for row in matrix:
            lines.append(f"[{tag}:{':'.join(map(str, row))}]")

    add_layer("PS_EL", el)  # Elevation
    add_layer("PS_TP", tm)  # Temperature
    add_layer("PS_RF", rn)  # Rainfall
    add_layer("PS_DR", dr)  # Drainage
    add_layer("PS_VL", vo)  # Volcanism
    add_layer("PS_SV", sv)  # Savagery

    return "\n".join(lines)


def generate_calibration_matrices(size=257):
    el = np.zeros((size, size), dtype=int)
    tm = np.full((size, size), 20, dtype=int)
    rn = np.full((size, size), 0, dtype=int)
    dr = np.full((size, size), 50, dtype=int)
    vo = np.zeros((size, size), dtype=int)
    sv = np.full((size, size), 50, dtype=int)

    STEP = 5
    t_range = np.arange(-50, 121, STEP)
    d_range = np.arange(0, 101, STEP)
    r_range = np.arange(0, 101, STEP)

    RECT_W = len(t_range)
    RECT_H = len(d_range)
    GAP = 2

    curr_x, curr_y = 2, 2

    for r_val in r_range:
        if curr_x + RECT_W >= size:
            curr_x = 2
            curr_y += RECT_H + GAP

        if curr_y + RECT_H >= size:
            break

        for dy, d_val in enumerate(d_range):
            for dx, t_val in enumerate(t_range):
                target_x = curr_x + dx
                target_y = curr_y + dy

                el[target_y, target_x] = 150
                tm[target_y, target_x] = t_val
                rn[target_y, target_x] = r_val
                dr[target_y, target_x] = d_val

        curr_x += RECT_W + GAP

    return el, tm, rn, dr, vo, sv


if __name__ == "__main__":
    SIZE = 257
    el, tm, rn, dr, vo, sv = generate_calibration_matrices(SIZE)

    output_text = format_as_world_gen(
        el, tm, rn, dr, vo, sv, "CALIBRATION", SIZE
    )

    with open("public/presets/calibration.txt", "w") as f:
        f.write(output_text)
