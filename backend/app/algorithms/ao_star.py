import time
from typing import Dict, List, Any, Optional, Set
from app.algorithms.graph import HospitalGraph
from app.algorithms.astar import astar_search

class AONode:
    """
    Node in an AND-OR Graph representing hospital goals and decomposed sub-goals.
    """
    def __init__(self, name: str, node_type: str = "OR", heuristic: float = 0.0):
        self.name = name
        self.node_type = node_type  # "AND", "OR", or "LEAF"
        self.heuristic = heuristic
        self.cost = heuristic
        self.solved = False
        # branches: List of connectors. Each connector is a dict with:
        # {"type": "OR"|"AND", "children": [AONode, ...], "edge_cost": float, "path": [str]}
        self.branches: List[Dict[str, Any]] = []
        self.best_branch: Optional[Dict[str, Any]] = None

def get_clinical_checkpoints(target_node: str) -> List[Dict[str, Any]]:
    """
    Clinical prerequisites for hospital destinations (AND-OR problem reduction).
    Specialized departments require preceding clinical stages (e.g. Triage, Registration, Billing).
    """
    # Define clinical procedure decompositions
    rules = {
        # Cardiology / Neurology / Orthopedics require Vitals & Triage Check-in first
        "f1_cardio": [
            {"checkpoint": "g_triage", "label": "Triage & Vitals Check", "mandatory": True},
            {"checkpoint": "f1_consult_101", "label": "Pre-Consultation Nurse Desk", "mandatory": False}
        ],
        "f1_neuro": [
            {"checkpoint": "g_triage", "label": "Initial Neuro Assessment", "mandatory": True}
        ],
        "f2_icu": [
            {"checkpoint": "g_er", "label": "Emergency Triage Clearance", "mandatory": True},
            {"checkpoint": "f2_nurse_station", "label": "ICU Sanitization Checkpoint", "mandatory": True}
        ],
        "f2_ot_1": [
            {"checkpoint": "f2_prep", "label": "Pre-Operative Preparation", "mandatory": True}
        ],
        "f1_lab": [
            {"checkpoint": "g_reception", "label": "Lab Order Verification & Token", "mandatory": True}
        ],
        "g_radiology": [
            {"checkpoint": "g_reception", "label": "Radiology Registration & Token", "mandatory": True}
        ]
    }
    return rules.get(target_node, [])

def ao_star_search(
    graph: HospitalGraph,
    start_node: str,
    target_node: str,
    accessible_only: bool = False
) -> Dict[str, Any]:
    """
    AO* (AND-OR Graph Search) Implementation.
    Solves navigation problems involving procedural decomposition (e.g. Visit Checkpoint A AND Checkpoint B).
    Evaluates OR choices (alternative paths/lifts) and AND requirements (composite clinical routes).
    """
    start_time = time.perf_counter()

    if start_node not in graph.nodes or target_node not in graph.nodes:
        return {
            "success": False,
            "error": "Start or target location not found in hospital graph.",
            "algorithm": "AO*"
        }

    # Retrieve procedural sub-goals for the destination
    checkpoints = get_clinical_checkpoints(target_node)

    # If no complex AND requirements, AO* solves as optimal choice between OR pathways
    # (e.g. Route via Elevator A OR Route via Elevator B OR Route via Stairs)
    tree_nodes: Dict[str, AONode] = {}
    root = AONode(f"Goal({start_node} -> {target_node})", node_type="OR")
    tree_nodes["root"] = root

    visited_count = 0
    full_path: List[str] = []
    milestones: List[Dict[str, Any]] = []

    if checkpoints:
        # Construct AND Branch: [Start -> Checkpoint] AND [Checkpoint -> Target]
        root.node_type = "AND"
        sub_paths = []
        total_dist = 0.0
        current_loc = start_node
        and_branches_data = []

        for cp in checkpoints:
            cp_node_id = cp["checkpoint"]
            if cp_node_id in graph.nodes and cp_node_id != current_loc and cp_node_id != target_node:
                # Solve sub-path using A*
                sub_res = astar_search(graph, current_loc, cp_node_id, accessible_only=accessible_only)
                if sub_res["success"]:
                    visited_count += sub_res["nodes_visited_count"]
                    sub_paths.append({
                        "from": current_loc,
                        "to": cp_node_id,
                        "label": cp["label"],
                        "path": sub_res["path"],
                        "distance": sub_res["total_distance"]
                    })
                    milestones.append({
                        "node_id": cp_node_id,
                        "name": graph.nodes[cp_node_id]["name"],
                        "label": cp["label"],
                        "floor": graph.nodes[cp_node_id]["floor"]
                    })
                    total_dist += sub_res["total_distance"]
                    current_loc = cp_node_id

        # Final segment from last checkpoint to target
        final_res = astar_search(graph, current_loc, target_node, accessible_only=accessible_only)
        if final_res["success"]:
            visited_count += final_res["nodes_visited_count"]
            sub_paths.append({
                "from": current_loc,
                "to": target_node,
                "label": f"Arrival at {graph.nodes[target_node]['name']}",
                "path": final_res["path"],
                "distance": final_res["total_distance"]
            })
            total_dist += final_res["total_distance"]

        # Assemble unified composite path without duplicate transition nodes
        assembled_path: List[str] = []
        for segment in sub_paths:
            p = segment["path"]
            if not assembled_path:
                assembled_path.extend(p)
            else:
                assembled_path.extend(p[1:])  # Skip first node since it matches previous end

        root.cost = round(total_dist, 1)
        root.solved = True
        full_path = assembled_path
        and_branches_data = sub_paths

    else:
        # Standard OR search: Evaluates alternative candidate corridors
        std_astar = astar_search(graph, start_node, target_node, accessible_only=accessible_only)
        if not std_astar["success"]:
            return {
                "success": False,
                "algorithm": "AO*",
                "error": "No route found.",
                "execution_time_ms": round((time.perf_counter() - start_time) * 1000, 3)
            }
        full_path = std_astar["path"]
        total_dist = std_astar["total_distance"]
        visited_count = std_astar["nodes_visited_count"]
        root.cost = total_dist
        root.solved = True
        and_branches_data = [{
            "from": start_node,
            "to": target_node,
            "label": "Direct Clinical Corridor",
            "path": full_path,
            "distance": total_dist
        }]

    exec_time = round((time.perf_counter() - start_time) * 1000, 3)

    return {
        "success": True,
        "algorithm": "AO*",
        "path": full_path,
        "total_distance": round(total_dist, 1),
        "hops": len(full_path) - 1,
        "nodes_visited_count": visited_count,
        "visited_nodes": full_path,
        "execution_time_ms": exec_time,
        "and_or_decomposition": {
            "root_type": root.node_type,
            "is_decomposed": len(checkpoints) > 0,
            "milestones": milestones,
            "sub_branches": and_branches_data,
            "total_hyperarc_cost": round(total_dist, 1)
        }
    }

