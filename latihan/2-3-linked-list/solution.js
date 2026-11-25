class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.count = 0;
  }

  size() { return this.count; }
  isEmpty() { return this.count === 0; }

  nodeAt(i) {
    if (!Number.isInteger(i) || i < 0 || i >= this.count) throw new RangeError("Indeks " + i + " di luar batas");
    let node = this.head;
    for (let k = 0; k < i; k++) node = node.next;
    return node;
  }

  valueAt(i) { return this.nodeAt(i).value; }

  pushFront(v) {
    this.head = { value: v, next: this.head };
    if (!this.tail) this.tail = this.head;
    this.count++;
  }

  popFront() {
    if (!this.head) throw new RangeError("List kosong");
    const v = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.count--;
    return v;
  }

  pushBack(v) {
    const node = { value: v, next: null };
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.count++;
  }

  popBack() {
    if (!this.head) throw new RangeError("List kosong");
    if (this.count === 1) return this.popFront();
    const before = this.nodeAt(this.count - 2);
    const v = this.tail.value;
    before.next = null;
    this.tail = before;
    this.count--;
    return v;
  }

  insert(i, v) {
    if (i === 0) return this.pushFront(v);
    if (i === this.count) return this.pushBack(v);
    const before = this.nodeAt(i - 1);
    before.next = { value: v, next: before.next };
    this.count++;
  }

  erase(i) {
    this.nodeAt(i);
    if (i === 0) return void this.popFront();
    const before = this.nodeAt(i - 1);
    if (before.next === this.tail) this.tail = before;
    before.next = before.next.next;
    this.count--;
  }

  reverse() {
    let prev = null;
    let cur = this.head;
    this.tail = this.head;
    while (cur) {
      const next = cur.next;
      cur.next = prev;
      prev = cur;
      cur = next;
    }
    this.head = prev;
  }

  toArray() {
    const out = [];
    for (let node = this.head; node; node = node.next) out.push(node.value);
    return out;
  }
}
