import time
import heapq
from typing import Dict, List, Any, Optional
from app.algorithms.graph import HospitalGraph

def astar_search(
    graph: HospitalGraph,
    start_node: str,
    target_node: str,
    accessible_only: bool = False
) -> Dict[str, Any]:
    """
    A* (A-Star) Pathfinding Algorithm.
    Uses cost g(n) + heuristic h(n) to find the optimal minimum-distance route.
    """
    start_time = time.perf_counter()

    if start_node not in graph.nodes or target_node not in graph.nodes:
        return {
            "success": False,
            "error": "Start or target location not found in hospital graph.",
            "algorithm": "A*"
        }

    if start_node == target_node:
        return {
            "success": True,
            "algorithm": "A*",
            "path": [start_node],
            "total_distance": 0.0,
            "hops": 0,
            "nodes_visited_count": 1,
            "visited_nodes": [start_node],
            "execution_time_ms": 0.01,
            "f_score": 0.0,
            "g_score": 0.0
        }

    # Priority queue stores tuples of (f_score, counter, current_node)
    counter = 0
    open_heap = []
    
    h_start = graph.get_heuristic(start_node, target_node)
    heapq.heappush(open_heap, (h_start, counter, start_node))

    came_from: Dict[str, str] = {}
    g_score: Dict[str, float] = {start_node: 0.0}
    f_score: Dict[str, float] = {start_node: h_start}

    closed_set = set()
    visited_sequence: List[str] = []

    found = False

    while open_heap:
        current_f, _, current = heapq.heappop(open_heap)

        if current in closed_set:
            continue

        closed_set.add(current)
        visited_sequence.append(current)

        if current == target_node:
            found = True
            break

        for edge in graph.get_neighbors(current, accessible_only=accessible_only):
            neighbor = edge["target"]
            if neighbor in closed_set:
                continue

            tentative_g = g_score[current] + edge["distance"]

            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                h = graph.get_heuristic(neighbor, target_node)
                f = tentative_g + h
                f_score[neighbor] = f
                counter += 1
                heapq.heappush(open_heap, (f, counter, neighbor))

    exec_time = round((time.perf_counter() - start_time) * 1000, 3)

    if not found:
        return {
            "success": False,
            "algorithm": "A*",
            "error": "No accessible route found between the specified points.",
            "nodes_visited_count": len(closed_set),
            "visited_nodes": visited_sequence,
            "execution_time_ms": exec_time
        }

    # Reconstruct optimal path
    path = []
    curr = target_node
    while curr in came_from:
        path.append(curr)
        curr = came_from[curr]
    path.append(start_node)
    path.reverse()

    total_dist = round(g_score[target_node], 1)

    return {
        "success": True,
        "algorithm": "A*",
        "path": path,
        "total_distance": total_dist,
        "hops": len(path) - 1,
        "nodes_visited_count": len(closed_set),
        "visited_nodes": visited_sequence,
        "execution_time_ms": exec_time,
        "g_score": total_dist,
        "f_score": round(f_score.get(target_node, total_dist), 1)
    }

