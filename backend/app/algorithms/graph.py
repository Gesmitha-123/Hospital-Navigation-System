import math
from typing import Dict, List, Optional, Tuple, Any

class HospitalGraph:
    """
    Hospital Multi-Floor Spatial Graph representation.
    Maintains nodes (locations) with coordinates (x, y, floor)
    and edges (corridors, lifts, stairs) with distances and attributes.
    """
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.adjacency: Dict[str, List[Dict[str, Any]]] = {}

    def add_node(self, node_id: str, name: str, floor: int, x: float, y: float, **attributes):
        self.nodes[node_id] = {
            "id": node_id,
            "name": name,
            "floor": floor,
            "x": x,
            "y": y,
            **attributes
        }
        if node_id not in self.adjacency:
            self.adjacency[node_id] = []

    def add_edge(
        self,
        source_id: str,
        target_id: str,
        distance: Optional[float] = None,
        accessible: bool = True,
        is_elevator: bool = False,
        is_stairs: bool = False,
        floor_transition: bool = False,
        direction_hint: str = "straight",
        bidirectional: bool = True
    ):
        if source_id not in self.nodes or target_id not in self.nodes:
            return

        # Calculate physical distance if not explicitly given
        if distance is None:
            n1 = self.nodes[source_id]
            n2 = self.nodes[target_id]
            dx = n1["x"] - n2["x"]
            dy = n1["y"] - n2["y"]
            df = abs(n1["floor"] - n2["floor"]) * 25.0  # Floor elevation cost
            distance = round(math.sqrt(dx * dx + dy * dy) * 0.1 + df, 1)

        edge_fwd = {
            "target": target_id,
            "distance": float(distance),
            "accessible": accessible,
            "is_elevator": is_elevator,
            "is_stairs": is_stairs,
            "floor_transition": floor_transition,
            "direction_hint": direction_hint
        }
        self.adjacency[source_id].append(edge_fwd)

        if bidirectional:
            edge_rev = {
                "target": source_id,
                "distance": float(distance),
                "accessible": accessible,
                "is_elevator": is_elevator,
                "is_stairs": is_stairs,
                "floor_transition": floor_transition,
                "direction_hint": direction_hint
            }
            if target_id not in self.adjacency:
                self.adjacency[target_id] = []
            self.adjacency[target_id].append(edge_rev)

    def get_neighbors(self, node_id: str, accessible_only: bool = False) -> List[Dict[str, Any]]:
        edges = self.adjacency.get(node_id, [])
        if accessible_only:
            # Exclude stairs if accessible/wheelchair mode is requested
            return [e for e in edges if e["accessible"] and not e["is_stairs"]]
        return edges

    def get_heuristic(self, node_u: str, node_v: str) -> float:
        """
        Admissible Euclidean distance heuristic with floor height penalty.
        h(u, v) <= true distance (triangle inequality satisfied).
        """
        if node_u not in self.nodes or node_v not in self.nodes:
            return 0.0

        u = self.nodes[node_u]
        v = self.nodes[node_v]

        dx = (u["x"] - v["x"]) * 0.08
        dy = (u["y"] - v["y"]) * 0.08
        # Vertical floor difference penalty (meters per floor)
        df = abs(u["floor"] - v["floor"]) * 12.0

        return math.sqrt(dx * dx + dy * dy) + df

