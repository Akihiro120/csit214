#!/usr/bin/env python3
"""
Directional flight‑time estimator for major Australian city‑pairs.

Key ideas
---------
1.  Great‑circle (haversine) distance.
2.  Base cruise speeds:
      • Jet routes ............... 830 km h⁻¹  (block average)
      • Turboprop routes (WOL) ... 350 km h⁻¹
3.  Winds aloft:
      • Mean westerly component .. +80 km h⁻¹ towards the east.
      • Projected onto the route via cos(bearing‑90°).
4.  Fixed 15‑min allowance for taxi, climb and descent.
"""

from math import radians, sin, cos, atan2, sqrt
from itertools import permutations
from pprint import pprint

# IATA → (latitude°, longitude°)
AIRPORT_COORDS = {
    "SYD": (-33.9399, 151.1753),   # Sydney
    "MEL": (-37.6690, 144.9010),   # Melbourne (Tullamarine)
    "ADL": (-34.9433, 138.5310),   # Adelaide
    "DRW": (-12.4086, 130.8727),   # Darwin
    "HBA": (-42.8361, 147.5090),   # Hobart
    "PER": (-31.9403, 115.9672),   # Perth
    "BNE": (-27.3842, 153.1175),   # Brisbane
    "WOL": (-34.5633, 150.7890),   # Shellharbour
}

# Model parameters
JET_SPEED    = 780     # km h‑1  – average block speed for domestic jets
PROP_SPEED   = 350     # km h‑1  – Link / Rex Saab‑size turboprops
BUFFER_MIN   = 20      # minutes – taxi + climb/descend
WESTERLY_KTS = 90      # km h‑1  – representative jet‑stream component (west→east)

EARTH_RADIUS = 6_371.0  # km

# ---------------------------------------------------------------------------

def haversine(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    """Great‑circle distance between two (lat, lon) points in kilometres."""
    lat1, lon1 = map(radians, p1)
    lat2, lon2 = map(radians, p2)
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS * atan2(sqrt(a), sqrt(1 - a))

def initial_bearing(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    """Return the initial great‑circle bearing from p1 to p2 in degrees."""
    lat1, lon1 = map(radians, p1)
    lat2, lon2 = map(radians, p2)
    dlon = lon2 - lon1
    x = sin(dlon) * cos(lat2)
    y = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlon)
    return (atan2(x, y) * 180 / 3.141592653589793 + 360) % 360

def block_minutes(origin: str, dest: str) -> int:
    """Directional block time (minutes) from origin to dest."""
    p1, p2 = AIRPORT_COORDS[origin], AIRPORT_COORDS[dest]
    distance = haversine(p1, p2)

    # Determine base cruise speed by aircraft type
    base_speed = PROP_SPEED if "WOL" in (origin, dest) else JET_SPEED

    # Wind component: westerly (blowing towards 090°)
    bearing = initial_bearing(p1, p2)
    wind_component = WESTERLY_KTS * cos(radians(bearing - 90))
    ground_speed = base_speed + wind_component

    # Protect against unrealistically low ground speed
    ground_speed = max(ground_speed, base_speed * 0.4)

    return round((distance / ground_speed) * 60 + BUFFER_MIN)

# ---------------------------------------------------------------------------

FLIGHT_TIMES: dict[tuple[str, str], int] = {
    (o, d): block_minutes(o, d)
    for o, d in permutations(AIRPORT_COORDS, 2)
}

# Calculate distances separately
FLIGHT_DISTANCES: dict[tuple[str, str], float] = {
    (o, d): round(haversine(AIRPORT_COORDS[o], AIRPORT_COORDS[d])) # Round distance to nearest km
    for o, d in permutations(AIRPORT_COORDS, 2)
}

# Demonstration
if __name__ == "__main__":
    print("--- Flight Times (minutes) ---")
    pprint(FLIGHT_TIMES)
    print("\n--- Flight Distances (km) ---")
    pprint(FLIGHT_DISTANCES)
    print("\nExample look‑ups:")
    print("SYD → PER Time:", FLIGHT_TIMES[("SYD", "PER")], "min")
    print("PER → SYD Time:", FLIGHT_TIMES[("PER", "SYD")], "min")
    print("SYD → PER Distance:", FLIGHT_DISTANCES[("SYD", "PER")], "km")
    print("PER → SYD Distance:", FLIGHT_DISTANCES[("PER", "SYD")], "km")
