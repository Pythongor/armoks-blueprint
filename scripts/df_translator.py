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
    _, min_lat, __, max_lat = bounds
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


def normalize_to_df_drainage(matrix, el_matrix, nodata_val=-32768, blend_radius=8, fallback_drainage=50):
    """
    Normalizes SoilGrids Volumetric Water Content (wv0010) to Dwarf Fortress Drainage (0-100).
    Smoothly extrapolates missing coastal data cells using the elevation matrix.
    """
    # 1. Establish a boolean mask for legitimate soil data cells
    # SoilGrids utilizes -32768 for unmapped regions
    valid_mask = (matrix != nodata_val) & (matrix >= 0)
    
    # --- COASTAL EDGE-CASE CODES ---
    # Identify land pixels that are completely missing from the drainage matrix
    land_mask = el_matrix >= 100
    fringe_mask = land_mask & ~valid_mask
    source_mask = land_mask & valid_mask
    
    working_matrix = matrix.copy().astype(float)
    process_mask = valid_mask.copy()
    
    # Only run diffusion logic if there are coastal missing pixels and valid land to copy from
    if np.any(fringe_mask) and np.any(source_mask):
        land_only_vwc = np.where(source_mask, matrix, 0.0)
        
        mask_blur = gaussian_filter(source_mask.astype(float), sigma=max(1, blend_radius / 2))
        vwc_blur = gaussian_filter(land_only_vwc, sigma=max(1, blend_radius / 2))
        
        # Diffuse adjacent land characteristics into ocean-fringe anomalies
        extended_vwc = np.where(mask_blur > 1e-5, vwc_blur / np.maximum(mask_blur, 1e-5), 250.0)
        
        # Apply changes ONLY to the fringe pixels
        working_matrix[fringe_mask] = extended_vwc[fringe_mask]
        process_mask[fringe_mask] = True
    # -------------------------------
    
    # 2. Populate the default output array with your fallback value
    df_drainage = np.full(matrix.shape, fallback_drainage, dtype=np.uint8)
    
    # Short-circuit handle if the tile is completely blank (e.g., deep ocean or poles)
    if not np.any(process_mask):
        return df_drainage
        
    valid_vwc = working_matrix[process_mask]
    
    # 3. Define operational parameters based on soil science properties
    # 50  = 5% VWC  -> Highly porous desert sand profiles
    # 450 = 45% VWC -> Highly reflective, fluid-retaining clay/wetland profiles
    vmin = 50
    vmax = 450
    
    # Clamp extreme outlier variances to protect our scale boundaries
    clipped_vwc = np.clip(valid_vwc, vmin, vmax)
    
    # 4. Apply inverse linear scaling: High Water Capacity equals Low Drainage Speed
    # Formula transforms vmax into 0.0 and vmin into 1.0
    normalized = (vmax - clipped_vwc) / (vmax - vmin)
    
    # Translate relative decimal float scales to the 0-100 integer grid
    df_values = normalized * 100
    
    # 5. Overwrite the valid data indices into our output matrix
    df_drainage[process_mask] = np.round(df_values).astype(np.uint8)
    
    return df_drainage


def map_to_df_climate(rainfall_array, geological_drainage_array, swamp_mitigation_gamma=0.65, drainage_floor=10):
    """
    Translates processed Earth data into 0-100 DF matrix values.
    Includes gamma correction to clear out excessive wetlands and preserves sand deserts.
    
    Parameters:
    - rainfall_array: Scaled 0-100 rainfall matrix
    - geological_drainage_array: Scaled 0-100 raw drainage matrix from SoilGrids
    - swamp_mitigation_gamma: Values < 1.0 push low values up, shrinking the 0-32 swamp bracket.
                              Try 0.6 to 0.7 to drastically reduce swamps.
    - drainage_floor: The absolute lowest drainage allowed outside of deserts.
    """
    df_rainfall = rainfall_array.copy()
    
    # 1. Normalize drainage to 0.0 - 1.0 to perform power-curve math safely
    norm_drainage = np.clip(geological_drainage_array / 100.0, 0.0, 1.0)
    
    # 2. Apply Gamma Correction to thin out the lower brackets
    # Example: if raw drainage is 15 (0.15 normalized), 0.15**0.65 = 0.29 (29 DF drainage)
    # This pushes it right up to the edge of turning into a normal forest instead of a swamp!
    calibrated_drainage = np.power(norm_drainage, swamp_mitigation_gamma) * 100.0
    
    # 3. Apply a defensive drainage floor for non-desert areas
    # This prevents total stagnation in heavy clay/wet soil zones
    calibrated_drainage = np.clip(calibrated_drainage, drainage_floor, 100)
    
    # 4. Re-apply the Hyper-Arid Desert Rule (DF Rainfall < 10)
    # We use the UNTOUCHED raw geological drainage here so the Sahara remains a pure 0-32 Sand Desert
    desert_mask = df_rainfall < 10
    calibrated_drainage[desert_mask] = 32 - (geological_drainage_array[desert_mask] * 0.32)
    
    # Final boundary check
    df_drainage = np.clip(calibrated_drainage, 0, 100).astype(np.int32)
    
    return df_rainfall, df_drainage


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
    # Standard initialization (0 = Ocean Background)
    el = np.zeros((size, size), dtype=int)
    tm = np.full((size, size), 20, dtype=int)
    rn = np.full((size, size), 0, dtype=int)
    dr = np.full((size, size), 50, dtype=int)
    vo = np.zeros((size, size), dtype=int)
    sv = np.full((size, size), 50, dtype=int)

    # CLIMATE SLABS
    STEP = 5
    t_range = np.arange(-50, 121, STEP)
    d_range = np.arange(0, 101, STEP)
    r_range = np.arange(0, 101, STEP)
    e_tiers = [100, 150, 200]

    RECT_W, RECT_H, GAP = 35, 21, 1
    curr_x, curr_y = 2, 2

    for e_val in e_tiers:
        curr_x = 2
        if e_val != e_tiers[0]:
            curr_y += RECT_H + 2

        for r_val in r_range:
            if curr_x + RECT_W >= 235:
                curr_x = 2
                curr_y += RECT_H + GAP

            if curr_y + RECT_H >= size:
                break

            el[curr_y:curr_y+RECT_H, curr_x:curr_x+RECT_W] = e_val
            # Fill gradients inside slab
            for dy, d_val in enumerate(d_range):
                for dx, t_val in enumerate(t_range):
                    tm[curr_y + dy, curr_x + dx] = t_val
                    rn[curr_y + dy, curr_x + dx] = r_val
                    dr[curr_y + dy, curr_x + dx] = d_val
            curr_x += RECT_W + GAP

    # THE ALTITUDE STRIPS
    STEP_T = 10
    STEP_E = 10
    t_range_alt = np.arange(-50, 121, STEP_T)
    e_range_alt = np.arange(0, 401, STEP_E)

    variations = [
        (0, 0), (50, 0), (100, 0),     # Low Drainage group
        (100, 0), (100, 50), (100, 100)  # Maximum Rainfall group
    ]

    STRIP_W, STRIP_H = 17, 41
    start_x_alt = 238
    curr_y_alt = 1

    for r_val, d_val in variations:
        if curr_y_alt + STRIP_H >= size:
            break

        for dy, e_val in enumerate(e_range_alt):
            for dx, t_val in enumerate(t_range_alt):
                tx, ty = start_x_alt + dx, curr_y_alt + dy
                el[ty, tx] = e_val
                tm[ty, tx] = t_val
                rn[ty, tx] = r_val
                dr[ty, tx] = d_val

        curr_y_alt += STRIP_H + 1

    return el, tm, rn, dr, vo, sv


if __name__ == "__main__":
    SIZE = 257
    el, tm, rn, dr, vo, sv = generate_calibration_matrices(SIZE)

    output_text = format_as_world_gen(
        el, tm, rn, dr, vo, sv, "CALIBRATION", SIZE
    )

    with open("public/presets/calibration.txt", "w") as f:
        f.write(output_text)
