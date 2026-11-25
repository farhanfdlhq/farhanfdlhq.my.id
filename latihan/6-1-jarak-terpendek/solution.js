function shortestPath(n, edges, from, to) {
  const next = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    next[a].push(b);
    next[b].push(a);
  }
  const dist = new Array(n).fill(-1);
  dist[from] = 0;
  const queue = [from];
  for (let i = 0; i < queue.length; i++) {
    const u = queue[i];
    if (u === to) return dist[u];
    for (const v of next[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }
  return -1;
}
