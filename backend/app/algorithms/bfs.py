import time
from collections import deque
from typing import Dict, List, Any, Optional
from app.algorithms.graph import HospitalGraph

def bfs_search(
    graph: HospitalGraph,
    start_node: str,
    target_node: str,
    accessible_only: bool = False
) -> Dict[str, Any]:
    """
    Breadth-First Search (BFS) route generation.
    Traverses graph level by level to find the route with the minimum number of edge hops.
    """
    start_time = time.perf_counter()

    if start_node not in graph.nodes or target_node not in graph.nodes:
        return {
            "success": False,
            "error": "Start or target location not found in hospital graph.",
            "algorithm": "BFS"
        }

    if start_node == target_node:
        return {
            "success": True,
            "algorithm": "BFS",
            "path": [start_node],
            "total_distance": 0.0,
            "hops": 0,
            "nodes_visited_count": 1,
            "visited_nodes": [start_node],
            "execution_time_ms": 0.01
        }

    queue = deque([[start_node]])
    visited = {start_node}
    visited_sequence = [start_node]

    found_path: Optional[List[str]] = None

    while queue:
        current_path = queue.popleft()
        current_node = current_path[-1]

        if current_node == target_node:
            found_path = current_path
            break

        neighbors = graph.get_neighbors(current_node, accessible_only=accessible_only)
        for edge in neighbors:
            neighbor = edge["target"]
            if neighbor not in visited:
                visited.add(neighbor)
                visited_sequence.append(neighbor)
                queue.append(current_path + [neighbor])

    exec_time = round((time.perf_counter() - start_time) * 1000, 3)

    if not found_path:
        return {
            "success": False,
            "algorithm": "BFS",
            "error": "No accessible route found between the specified points.",
            "nodes_visited_count": len(visited),
            "visited_nodes": visited_sequence,
            "execution_time_ms": exec_time
        }

    # Calculate total physical distance along path
    total_dist = 0.0
    for i in range(len(found_path) - 1):
        u, v = found_path[i], found_path[i + 1]
        for edge in graph.get_neighbors(u, accessible_only=False):
            if edge["target"] == v:
                total_dist += edge["distance"]
                break

    return {
        "success": True,
        "algorithm": "BFS",
        "path": found_path,
        "total_distance": round(total_dist, 1),
        "hops": len(found_path) - 1,
        "nodes_visited_count": len(visited),
        "visited_nodes": visited_sequence,
        "execution_time_ms": exec_time
    }

