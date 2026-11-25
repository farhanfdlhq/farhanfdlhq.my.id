function topoSort(n, edges) {
  const next = Array.from({ length: n }, () => []);
  const incoming = new Array(n).fill(0);
  for (const [a, b] of edges) {
    next[a].push(b);
    incoming[b]++;
  }
  const done = new Array(n).fill(false);
  const order = [];
  while (order.length < n) {
    let pick = -1;
    for (let u = 0; u < n; u++) if (!done[u] && incoming[u] === 0) { pick = u; break; }
    if (pick === -1) return null;
    done[pick] = true;
    order.push(pick);
    for (const v of next[pick]) incoming[v]--;
  }
  return order;
}
