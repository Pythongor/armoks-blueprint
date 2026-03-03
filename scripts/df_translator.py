from scipy.ndimage import laplace
import numpy as np


def normalize_to_df_temperature(matrix):
    """WorldClim Temp is Celsius * 10. Map -30C..35C to 0..100."""
    # Handle 'no-data' values
    matrix[matrix < -5000] = -300

    # Simple interpolation
    # -300 (-30C) -> 0 (Frozen)
    # 350 (+35C) -> 100 (Scorching)
    return np.interp(matrix, [-300, 350], [0, 100]).astype(int)


def normalize_to_df_rainfall(matrix):
    """WorldClim Rain is mm/year. Map 0..3000mm to 0..100."""
    # 0mm -> 0 (Desert)
    # 3000mm+ -> 100 (Tropical Rainforest)
    return np.interp(matrix, [0, 3000], [0, 100]).astype(int)


def normalize_to_df_elevation(matrix):
    """Translates real meters to 0-400 DF values using 3-segment interpolation."""
    final = np.zeros_like(matrix, dtype=int)

    # 0 - 99: Deepest Trench (-11000m) to Sea Level (0m)
    ocean = matrix < 0
    final[ocean] = np.interp(matrix[ocean], [-11000, 0], [0, 99])

    # 100 - 300: Sea Level (0m) to Mountain Base (2000m)
    low_land = (matrix >= 0) & (matrix < 2000)
    final[low_land] = np.interp(matrix[low_land], [0, 2000], [100, 300])

    # 301 - 400: Mountain Base (2000m) to Everest (8848m)
    high_land = matrix >= 2000
    final[high_land] = np.interp(matrix[high_land], [2000, 8848], [301, 400])

    return final


def calculate_drainage(raw_elevation):
    """Calculates drainage based on terrain roughness/slope."""
    # Laplace highlights edges and steep changes in height
    edge_data = np.abs(laplace(raw_elevation.astype(float)))
    # We map steep edges to high drainage (100) and flats to low (0)
    return np.interp(edge_data, [edge_data.min(), edge_data.max()], [0, 100]).astype(int)


def calculate_drainage_advanced(raw_el, raw_tm, raw_rn):
    """
    Calculates drainage as a balance of terrain slope and water retention.
    High value = High drainage (Water leaves quickly).
    Low value = Low drainage (Water stays / Swampy).
    """
    # 1. Slope Factor (Laplace of elevation)
    # Steep slopes always drain fast.
    slope_impact = np.abs(laplace(raw_el.astype(float)))
    slope_norm = np.interp(
        slope_impact, [slope_impact.min(), slope_impact.max()], [0, 80])

    # 2. Evapotranspiration Proxy (Temp vs Rain)
    # Heat increases evaporation (higher drainage of surface water)
    # Cold/Rainy areas keep water (lower drainage/swampy)
    # WorldClim BIO1 is C*10.
    evap_proxy = (raw_tm / 10.0) * 2.0
    rain_proxy = raw_rn / 50.0

    retention_balance = evap_proxy - rain_proxy

    # 3. Combine
    # We add slope impact to the evaporation/rain balance
    combined = slope_norm + retention_balance

    # Normalize to DF 0-100 range
    return np.interp(combined, [combined.min(), combined.max()], [0, 100]).astype(int)


def format_as_world_gen(elevation_matrix, temperature_matrix, rainfall_matrix, drainage_matrix, title, size):
    """Generates the final .txt string for the Scriptorium."""
    lines = [
        "[WORLD_GEN]",
        f"[TITLE:{title}]",
        f"[DIM:{size}]"
    ]
    for row in elevation_matrix:
        lines.append(f"[PS_EL:{':'.join(map(str, row))}]")
    for row in temperature_matrix:
        lines.append(f"[PS_TM:{':'.join(map(str, row))}]")
    for row in rainfall_matrix:
        lines.append(f"[PS_RF:{':'.join(map(str, row))}]")
    for row in drainage_matrix:
        lines.append(f"[PS_DR:{':'.join(map(str, row))}]")

    return "\n".join(lines)
