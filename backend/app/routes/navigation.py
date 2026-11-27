from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models import Location, Connection
from app.algorithms.graph import HospitalGraph
from app.algorithms.bfs import bfs_search
from app.algorithms.astar import astar_search
from app.algorithms.ao_star import ao_star_search
from app.algorithms.directions import generate_directions

router = APIRouter(prefix="/api/route", tags=["Navigation Routing"])

class RouteRequest(BaseModel):
    source_id: str = Field(..., description="Starting location node ID")
    target_id: str = Field(..., description="Destination location node ID")
    algorithm: str = Field("astar", description="Pathfinding algorithm: 'astar', 'bfs', or 'ao_star'")
    accessible_only: bool = Field(False, description="Exclude stairs and steep connections for wheelchair users")

def build_graph_from_db(db: Session) -> HospitalGraph:
    """Constructs in-memory HospitalGraph from database records."""
    graph = HospitalGraph()
    locations = db.query(Location).all()
    for loc in locations:
        graph.add_node(
            node_id=loc.id,
            name=loc.name,
            floor=loc.floor_number,
            x=loc.x,
            y=loc.y,
            category=loc.category_id,
            is_accessible=loc.is_accessible,
            is_emergency=loc.is_emergency,
            room_number=loc.room_number,
            department=loc.department
        )

    connections = db.query(Connection).all()
    for conn in connections:
        graph.add_edge(
            source_id=conn.source_id,
            target_id=conn.target_id,
            distance=conn.distance_meters,
            accessible=conn.is_accessible,
            is_elevator=conn.is_elevator,
            is_stairs=conn.is_stairs,
            floor_transition=conn.floor_transition,
            direction_hint=conn.direction_hint,
            bidirectional=conn.bidirectional
        )
    return graph

@router.post("")
def calculate_route(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Computes optimal route between two points using selected algorithm (A*, BFS, or AO*).
    Includes step-by-step turns, distance, estimated time, and multi-floor breakdown.
    """
    graph = build_graph_from_db(db)

    if request.source_id not in graph.nodes:
        raise HTTPException(status_code=404, detail=f"Source location '{request.source_id}' not found.")
    if request.target_id not in graph.nodes:
        raise HTTPException(status_code=404, detail=f"Destination '{request.target_id}' not found.")

    algo = request.algorithm.lower().strip()
    if algo in ["astar", "a*", "a_star"]:
        result = astar_search(graph, request.source_id, request.target_id, accessible_only=request.accessible_only)
    elif algo in ["bfs", "breadth_first"]:
        result = bfs_search(graph, request.source_id, request.target_id, accessible_only=request.accessible_only)
    elif algo in ["ao_star", "ao*", "aostar"]:
        result = ao_star_search(graph, request.source_id, request.target_id, accessible_only=request.accessible_only)
    else:
        raise HTTPException(status_code=400, detail="Invalid algorithm. Supported: 'astar', 'bfs', 'ao_star'.")

    if not result.get("success"):
        return {
            "success": False,
            "error": result.get("error", "No route found."),
            "algorithm": result.get("algorithm", algo),
            "accessible_only": request.accessible_only
        }

    path_nodes = result["path"]

    # Generate natural language turn-by-turn directions
    directions = generate_directions(graph, path_nodes)

    # Enrich path nodes with coordinates and floor details
    detailed_path = []
    floors_involved = set()
    for node_id in path_nodes:
        n = graph.nodes[node_id]
        floors_involved.add(n["floor"])
        detailed_path.append({
            "id": n["id"],
            "name": n["name"],
            "floor": n["floor"],
            "x": n["x"],
            "y": n["y"],
            "category": n.get("category"),
            "room_number": n.get("room_number"),
            "department": n.get("department")
        })

    # Group path segments by floor for multi-floor map visualization
    floor_legs: Dict[int, List[Dict[str, Any]]] = {}
    current_leg: List[Dict[str, Any]] = []
    current_floor = detailed_path[0]["floor"] if detailed_path else 0

    for pt in detailed_path:
        if pt["floor"] != current_floor:
            if current_leg:
                if current_floor not in floor_legs:
                    floor_legs[current_floor] = []
                floor_legs[current_floor].extend(current_leg)
            current_floor = pt["floor"]
            current_leg = [pt]
        else:
            current_leg.append(pt)

    if current_leg:
        if current_floor not in floor_legs:
            floor_legs[current_floor] = []
        floor_legs[current_floor].extend(current_leg)

    source_node = graph.nodes[request.source_id]
    target_node = graph.nodes[request.target_id]

    return {
        "success": True,
        "algorithm": result.get("algorithm"),
        "source": {
            "id": source_node["id"],
            "name": source_node["name"],
            "floor": source_node["floor"]
        },
        "destination": {
            "id": target_node["id"],
            "name": target_node["name"],
            "floor": target_node["floor"]
        },
        "total_distance_meters": result["total_distance"],
        "total_hops": result["hops"],
        "estimated_walking_time": directions["estimated_time_formatted"],
        "estimated_seconds": directions["estimated_time_seconds"],
        "is_accessible": request.accessible_only,
        "is_multi_floor": len(floors_involved) > 1,
        "floors_involved": sorted(list(floors_involved)),
        "path_node_ids": path_nodes,
        "path_nodes": detailed_path,
        "floor_legs": floor_legs,
        "steps": directions["steps"],
        "floor_transitions": directions["floor_transitions"],
        "algorithm_stats": {
            "name": result.get("algorithm"),
            "nodes_visited_count": result.get("nodes_visited_count", len(path_nodes)),
            "execution_time_ms": result.get("execution_time_ms", 0.0),
            "visited_sequence": result.get("visited_nodes", []),
            "and_or_decomposition": result.get("and_or_decomposition")
        }
    }

@router.post("/compare")
def compare_algorithms(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Runs BFS, A*, and AO* simultaneously and returns side-by-side performance benchmarks.
    """
    graph = build_graph_from_db(db)

    if request.source_id not in graph.nodes or request.target_id not in graph.nodes:
        raise HTTPException(status_code=404, detail="Source or target location not found.")

    res_astar = astar_search(graph, request.source_id, request.target_id, accessible_only=request.accessible_only)
    res_bfs = bfs_search(graph, request.source_id, request.target_id, accessible_only=request.accessible_only)
    res_aostar = ao_star_search(graph, request.source_id, request.target_id, accessible_only=request.accessible_only)

    return {
        "comparison": [
            {
                "algorithm": "A* Algorithm",
                "tagline": "Heuristic Optimal Distance",
                "success": res_astar["success"],
                "distance_meters": res_astar.get("total_distance", 0),
                "hops": res_astar.get("hops", 0),
                "nodes_explored": res_astar.get("nodes_visited_count", 0),
                "execution_time_ms": res_astar.get("execution_time_ms", 0),
                "path": res_astar.get("path", [])
            },
            {
                "algorithm": "Breadth-First Search (BFS)",
                "tagline": "Fewest Edge Hops",
                "success": res_bfs["success"],
                "distance_meters": res_bfs.get("total_distance", 0),
                "hops": res_bfs.get("hops", 0),
                "nodes_explored": res_bfs.get("nodes_visited_count", 0),
                "execution_time_ms": res_bfs.get("execution_time_ms", 0),
                "path": res_bfs.get("path", [])
            },
            {
                "algorithm": "AO* Algorithm",
                "tagline": "AND-OR Goal Decomposition",
                "success": res_aostar["success"],
                "distance_meters": res_aostar.get("total_distance", 0),
                "hops": res_aostar.get("hops", 0),
                "nodes_explored": res_aostar.get("nodes_visited_count", 0),
                "execution_time_ms": res_aostar.get("execution_time_ms", 0),
                "path": res_aostar.get("path", []),
                "is_decomposed": res_aostar.get("and_or_decomposition", {}).get("is_decomposed", False),
                "milestones": res_aostar.get("and_or_decomposition", {}).get("milestones", [])
            }
        ]
    }

@router.get("/emergency/nearest")
def get_nearest_emergency(
    current_location_id: str = "g_entrance",
    target_type: str = "exit",
    accessible_only: bool = False,
    db: Session = Depends(get_db)
):

    """
    Finds nearest Emergency Exit or Emergency Room and generates an emergency evacuation route.
    """
    graph = build_graph_from_db(db)

    if current_location_id not in graph.nodes:
        raise HTTPException(status_code=404, detail="Current location not found in graph.")

    curr_node = graph.nodes[current_location_id]
    curr_floor = curr_node["floor"]

    # Target candidates
    candidates = []
    for node_id, n in graph.nodes.items():
        if target_type == "er":
            if n["id"] in ["g_er", "f2_icu"]:
                candidates.append(node_id)
        else:
            # Emergency exits
            if n.get("category") == "exit" or n.get("is_emergency") or "exit" in node_id:
                if accessible_only:
                    if n.get("is_accessible"):
                        candidates.append(node_id)
                else:
                    candidates.append(node_id)

    if not candidates:
        # Fallback to ground entrance or ground exit
        candidates = ["g_exit_west", "g_exit_east", "g_entrance"]

    # Run A* to all candidates and pick minimum distance
    best_route = None
    min_dist = float("inf")

    for cand in candidates:
        res = astar_search(graph, current_location_id, cand, accessible_only=accessible_only)
        if res["success"] and res["total_distance"] < min_dist:
            min_dist = res["total_distance"]
            best_route = res
            best_target = cand

    if not best_route:
        raise HTTPException(status_code=404, detail="No viable evacuation route found.")

    directions = generate_directions(graph, best_route["path"])
    detailed_path = [
        {
            "id": graph.nodes[nid]["id"],
            "name": graph.nodes[nid]["name"],
            "floor": graph.nodes[nid]["floor"],
            "x": graph.nodes[nid]["x"],
            "y": graph.nodes[nid]["y"],
            "is_emergency": graph.nodes[nid].get("is_emergency", False)
        }
        for nid in best_route["path"]
    ]

    target_info = graph.nodes[best_target]

    return {
        "emergency_alert": "EVACUATION ROUTE GENERATED",
        "target": {
            "id": target_info["id"],
            "name": target_info["name"],
            "floor": target_info["floor"]
        },
        "distance_meters": best_route["total_distance"],
        "estimated_seconds": directions["estimated_time_seconds"],
        "estimated_time": directions["estimated_time_formatted"],
        "path": best_route["path"],
        "path_nodes": detailed_path,
        "steps": directions["steps"],
        "floor_transitions": directions["floor_transitions"]
    }
