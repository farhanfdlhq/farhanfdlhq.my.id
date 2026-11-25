class Trie {
  constructor() {
    this.root = { children: new Map(), end: false };
    this.count = 0;
  }

  insert(w) {
    let node = this.root;
    for (const ch of w) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), end: false });
      node = node.children.get(ch);
    }
    if (!node.end) this.count++;
    node.end = true;
  }

  find(p) {
    let node = this.root;
    for (const ch of p) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  has(w) {
    const node = this.find(w);
    return !!node && node.end;
  }

  startsWith(p) {
    return this.count > 0 && this.find(p) !== null;
  }

  wordsWith(p) {
    const start = this.find(p);
    const out = [];
    function collect(node, word) {
      if (node.end) out.push(word);
      for (const ch of [...node.children.keys()].sort()) collect(node.children.get(ch), word + ch);
    }
    if (start) collect(start, p);
    return out;
  }
}
