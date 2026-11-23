import heapq
import math
from collections import deque, defaultdict

def make_graph(locations, connections, accessible_only=False):
    graph = defaultdict(list)
    coords = {loc.id: (loc.x, loc.y, loc.floor) for loc in locations}
    for edge in connections:
        if accessible_only and not edge.accessible:
            continue
        graph[edge.from_id].append((edge.to_id, edge.distance))
        graph[edge.to_id].append((edge.from_id, edge.distance))
    return graph, coords

def reconstruct(parent, start, goal):
    if goal != start and goal not in parent:
        return []
    path, cur = [], goal
    while cur is not None:
        path.append(cur)
        if cur == start:
            break
        cur = parent.get(cur)
    return list(reversed(path)) if path and path[-1] == start else []

def bfs(graph, start, goal):
    queue = deque([start])
    parent = {start: None}
    while queue:
        node = queue.popleft()
        if node == goal:
            break
        for neighbor, _ in graph.get(node, []):
            if neighbor not in parent:
                parent[neighbor] = node
                queue.append(neighbor)
    path = reconstruct(parent, start, goal)
    return path, sum(next(w for n, w in graph[a] if n == b) for a, b in zip(path, path[1:])) if path else 0

def heuristic(a, b, coords):
    ax, ay, af = coords[a]
    bx, by, bf = coords[b]
    # A small floor penalty encourages sensible routes; edge distances are demo units.
    return math.hypot(ax - bx, ay - by) + abs(af - bf) * 8

def astar(graph, start, goal, coords):
    heap = [(heuristic(start, goal, coords), 0, start)]
    parent = {start: None}
    best = {start: 0}
    while heap:
        _, cost, node = heapq.heappop(heap)
        if cost != best.get(node):
            continue
        if node == goal:
            break
        for neighbor, weight in graph.get(node, []):
            new_cost = cost + weight
            if new_cost < best.get(neighbor, float("inf")):
                best[neighbor] = new_cost
                parent[neighbor] = node
                heapq.heappush(heap, (new_cost + heuristic(neighbor, goal, coords), new_cost, neighbor))
    path = reconstruct(parent, start, goal)
    return path, best.get(goal, 0) if path else 0

def ao_style(graph, start, goal):
    """
    Educational AND/OR-style planner: treats each immediate neighbor as an OR choice
    and can present a combined route via a shared intermediate (AND-style explanation).
    This is a small demonstrator, not a complete general AO* implementation.
    """
    # Find up to three candidate routes by penalizing already-used edges.
    candidates = []
    blocked = set()
    for _ in range(3):
        heap = [(0, start, [start])]
        best = {start: 0}
        found = None
        while heap:
            cost, node, path = heapq.heappop(heap)
            if node == goal:
                found = (path, cost)
                break
            for nxt, weight in graph.get(node, []):
                edge = tuple(sorted((node, nxt)))
                penalty = 10000 if edge in blocked else 0
                nc = cost + weight + penalty
                if nc < best.get(nxt, float("inf")):
                    best[nxt] = nc
                    heapq.heappush(heap, (nc, nxt, path + [nxt]))
        if not found:
            break
        candidates.append(found)
        for a, b in zip(found[0], found[0][1:]):
            blocked.add(tuple(sorted((a, b))))
    if not candidates:
        return [], 0, []
    candidates.sort(key=lambda item: item[1])
    chosen_path, chosen_cost = candidates[0]
    return chosen_path, chosen_cost, [{"path": p, "cost": round(c, 1)} for p, c in candidates]
