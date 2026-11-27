import math
from typing import Dict, List, Any
from app.algorithms.graph import HospitalGraph

def calculate_bearing(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculates bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)."""
    dx = x2 - x1
    dy = y2 - y1
    rad = math.atan2(dx, -dy)  # SVG y increases downward
    deg = math.degrees(rad)
    return (deg + 360) % 360

def get_turn_direction(b1: float, b2: float) -> str:
    """Determine turn instruction based on relative angle change."""
    diff = (b2 - b1 + 360) % 360
    if diff > 180:
        diff -= 360  # Range -180 to 180

    if -25 <= diff <= 25:
        return "straight"
    elif 25 < diff <= 65:
        return "slight_right"
    elif 65 < diff <= 120:
        return "turn_right"
    elif diff > 120:
        return "sharp_right"
    elif -65 <= diff < -25:
        return "slight_left"
    elif -120 <= diff < -65:
        return "turn_left"
    else:
        return "sharp_left"

def generate_directions(graph: HospitalGraph, path: List[str]) -> Dict[str, Any]:
    """
    Generates detailed turn-by-turn navigation instructions, icons, distance,
    and walking time estimates.
    """
    if not path or len(path) == 0:
        return {
            "steps": [],
            "estimated_time_seconds": 0,
            "estimated_time_formatted": "0 min",
            "floor_transitions": []
        }

    if len(path) == 1:
        node = graph.nodes[path[0]]
        return {
            "steps": [{
                "step_number": 1,
                "node_id": node["id"],
                "instruction": f"You are already at {node['name']}.",
                "direction": "destination",
                "distance_meters": 0.0,
                "floor": node["floor"]
            }],
            "estimated_time_seconds": 0,
            "estimated_time_formatted": "0 min",
            "floor_transitions": []
        }

    steps = []
    total_time_seconds = 0
    floor_transitions = []

    # Initial start step
    start_node = graph.nodes[path[0]]
    floor_names = {0: "Ground Floor", 1: "First Floor", 2: "Second Floor"}

    steps.append({
        "step_number": 1,
        "node_id": start_node["id"],
        "node_name": start_node["name"],
        "instruction": f"Start at {start_node['name']} ({floor_names.get(start_node['floor'], f'Floor {start_node['floor']}')}).",
        "direction": "start",
        "distance_meters": 0.0,
        "floor": start_node["floor"]
    })

    current_bearing = None

    for i in range(len(path) - 1):
        u_id = path[i]
        v_id = path[i + 1]
        u = graph.nodes[u_id]
        v = graph.nodes[v_id]

        # Find edge connecting u and v
        edge_data = None
        for e in graph.get_neighbors(u_id, accessible_only=False):
            if e["target"] == v_id:
                edge_data = e
                break

        dist = edge_data["distance"] if edge_data else 5.0
        # Average walking speed 1.1 m/s
        walk_time = dist / 1.1
        total_time_seconds += walk_time

        # Check floor transition
        if u["floor"] != v["floor"]:
            is_elevator = edge_data and edge_data.get("is_elevator", False)
            mode = "Elevator" if is_elevator else "Staircase"
            action = "Take" if is_elevator else "Use"
            direction_type = "elevator_up" if (is_elevator and v["floor"] > u["floor"]) else \
                             "elevator_down" if is_elevator else \
                             "stairs_up" if v["floor"] > u["floor"] else "stairs_down"

            from_floor = floor_names.get(u["floor"], f"Floor {u['floor']}")
            to_floor = floor_names.get(v["floor"], f"Floor {v['floor']}")

            # Elevators take ~25s wait & transit time, stairs ~15s
            vertical_time = 25 if is_elevator else 15
            total_time_seconds += vertical_time

            floor_transitions.append({
                "from_floor": u["floor"],
                "to_floor": v["floor"],
                "facility": mode,
                "node_id": u_id
            })

            steps.append({
                "step_number": len(steps) + 1,
                "node_id": v["id"],
                "node_name": v["name"],
                "instruction": f"{action} {mode} from {from_floor} to {to_floor}.",
                "direction": direction_type,
                "distance_meters": dist,
                "floor": v["floor"],
                "is_transition": True
            })
            current_bearing = None  # Reset bearing after floor change
            continue

        # Same floor movement: calculate angle/turn
        segment_bearing = calculate_bearing(u["x"], u["y"], v["x"], v["y"])

        if current_bearing is None:
            # First move on this floor
            direction = "straight"
            instruction = f"Walk straight towards {v['name']} ({dist:.1f} m)."
        else:
            turn = get_turn_direction(current_bearing, segment_bearing)
            direction = turn
            turn_phrase = {
                "straight": "Continue straight",
                "slight_right": "Bear slightly right",
                "turn_right": "Turn right",
                "sharp_right": "Turn sharp right",
                "slight_left": "Bear slightly left",
                "turn_left": "Turn left",
                "sharp_left": "Turn sharp left"
            }.get(turn, "Walk")

            if i == len(path) - 2:
                # Approaching destination
                instruction = f"{turn_phrase} towards your destination: {v['name']} ({dist:.1f} m)."
            else:
                instruction = f"{turn_phrase} past {u['name']} towards {v['name']} ({dist:.1f} m)."

        steps.append({
            "step_number": len(steps) + 1,
            "node_id": v["id"],
            "node_name": v["name"],
            "instruction": instruction,
            "direction": direction,
            "distance_meters": dist,
            "floor": v["floor"],
            "is_transition": False
        })

        current_bearing = segment_bearing

    # Destination arrived step
    dest_node = graph.nodes[path[-1]]
    steps.append({
        "step_number": len(steps) + 1,
        "node_id": dest_node["id"],
        "node_name": dest_node["name"],
        "instruction": f"You have arrived at your destination: {dest_node['name']}.",
        "direction": "destination",
        "distance_meters": 0.0,
        "floor": dest_node["floor"]
    })

    minutes = int(total_time_seconds // 60)
    seconds = int(total_time_seconds % 60)
    time_str = f"{minutes} min {seconds} sec" if minutes > 0 else f"{seconds} sec"

    return {
        "steps": steps,
        "estimated_time_seconds": round(total_time_seconds),
        "estimated_time_formatted": time_str,
        "floor_transitions": floor_transitions
    }

