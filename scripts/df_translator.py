import numpy as np


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


def format_as_world_gen(elevation_matrix, title, size):
    """Generates the final .txt string for the Scriptorium."""
    lines = [
        "[WORLD_GEN]",
        f"[TITLE:{title}]",
        f"[DIM:{size}]"
    ]
    for row in elevation_matrix:
        lines.append(f"[PS_EL:{':'.join(map(str, row))}]")

    return "\n".join(lines)
