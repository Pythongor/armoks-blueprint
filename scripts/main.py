import argparse
import os
import sys
from geo_utils import calculate_square_bounds
from data_engine import extract_layer_from_single_tif, extract_elevation_matrix
from df_translator import calculate_drainage_advanced, normalize_to_df_rainfall, normalize_to_df_temperature, normalize_to_df_elevation, format_as_world_gen, normalize_to_df_temperature
from library import get_region_data


def main():
    parser = argparse.ArgumentParser(description="Scriptorium World Forge")

    # New Library Argument
    parser.add_argument("--name", type=str,
                        help="Name of the region from library.py")

    # Manual Override Arguments
    parser.add_argument("--center", nargs=2, type=float,
                        help="Manual Lat and Lon")
    parser.add_argument("--range", type=float,
                        help="Manual Square side length in KM")

    # General Arguments
    parser.add_argument("--size", type=int, default=257)
    parser.add_argument("--title", type=str, help="Override default title")

    args = parser.parse_args()

    # Determine Coordinates
    if args.name:
        region = get_region_data(args.name)
        if not region:
            print(f"❌ Error: '{args.name}' not found in library.py.")
            sys.exit(1)
        lat, lon, km_range = region
        title = args.title or args.name.upper()
    elif args.center and args.range:
        lat, lon = args.center
        km_range = args.range
        title = args.title or "NEW_WORLD"
    else:
        print("❌ Error: Provide either --name OR --center and --range.")
        sys.exit(1)

    # Geo Logic
    if args.name == "world":
        # The absolute bounds of the GEBCO dataset
        bounds = (-180.0, -90.0, 180.0, 90.0)
        title = args.title or "THE_WHOLE_WORLD"
    elif args.name:
        bounds = calculate_square_bounds(lat, lon, km_range)

    # Elevation Logic
    try:
        raw_matrix = extract_elevation_matrix(bounds, args.size)
    except FileNotFoundError as e:
        print(f"❌ {e}")
        sys.exit(1)

    # Elevation (GEBCO)
    raw_el = extract_elevation_matrix(bounds, args.size)

    # Temperature (WorldClim BIO1)
    temp_tif = os.path.join("data", "worldclim", "wc2.1_30s_bio_1.tif")
    raw_tm = extract_layer_from_single_tif(bounds, args.size, temp_tif)

    # Rainfall (WorldClim BIO12)
    rain_tif = os.path.join("data", "worldclim", "wc2.1_30s_bio_12.tif")
    raw_rn = extract_layer_from_single_tif(bounds, args.size, rain_tif)

    #  Processing and translation
    print("🧪  Processing layers...")
    df_el = normalize_to_df_elevation(raw_el)
    df_tm = normalize_to_df_temperature(raw_tm)
    df_rn = normalize_to_df_rainfall(raw_rn)
    df_dr = calculate_drainage_advanced(raw_el, raw_tm, raw_rn)

    # Export
    output_text = format_as_world_gen(
        df_el, df_tm, df_rn, df_dr, title, args.size)

    # Save
    filename = f"{title.lower().replace(' ', '_')}.txt"
    file_path = f"output/{filename}"
    os.makedirs("output", exist_ok=True)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(output_text)

    print(
        f"✅ Success: '{title}' ({args.size}x{args.size}) forged into {filename}")


if __name__ == "__main__":
    main()
