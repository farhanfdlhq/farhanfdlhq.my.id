class BST {
  constructor() {
    this.root = null;
  }

  insert(v) {
    const node = { value: v, left: null, right: null };
    if (!this.root) { this.root = node; return; }
    let cur = this.root;
    for (;;) {
      if (v === cur.value) return;
      const side = v < cur.value ? "left" : "right";
      if (!cur[side]) { cur[side] = node; return; }
      cur = cur[side];
    }
  }

  contains(v) {
    let cur = this.root;
    while (cur) {
      if (v === cur.value) return true;
      cur = v < cur.value ? cur.left : cur.right;
    }
    return false;
  }

  min() {
    let cur = this.root;
    if (!cur) return null;
    while (cur.left) cur = cur.left;
    return cur.value;
  }

  max() {
    let cur = this.root;
    if (!cur) return null;
    while (cur.right) cur = cur.right;
    return cur.value;
  }

  height(node = this.root) {
    return node ? 1 + Math.max(this.height(node.left), this.height(node.right)) : 0;
  }

  inorder(node = this.root, out = []) {
    if (node) {
      this.inorder(node.left, out);
      out.push(node.value);
      this.inorder(node.right, out);
    }
    return out;
  }
}
