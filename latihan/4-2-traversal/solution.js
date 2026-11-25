function traverse(tree, order) {
  const out = [];
  if (order === "level") {
    const queue = tree ? [tree] : [];
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i];
      out.push(node.v);
      if (node.l) queue.push(node.l);
      if (node.r) queue.push(node.r);
    }
    return out;
  }
  function walk(node) {
    if (!node) return;
    if (order === "pre") out.push(node.v);
    walk(node.l);
    if (order === "in") out.push(node.v);
    walk(node.r);
    if (order === "post") out.push(node.v);
  }
  walk(tree);
  return out;
}
