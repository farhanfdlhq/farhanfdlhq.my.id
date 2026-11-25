function hasCycle(n, edges) {
  const next = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) next[a].push(b);
  const state = new Array(n).fill(0); // 0 belum, 1 di jalur, 2 selesai
  function dfs(u) {
    state[u] = 1;
    for (const v of next[u]) {
      if (state[v] === 1) return true;
      if (state[v] === 0 && dfs(v)) return true;
    }
    state[u] = 2;
    return false;
  }
  for (let u = 0; u < n; u++) if (state[u] === 0 && dfs(u)) return true;
  return false;
}
