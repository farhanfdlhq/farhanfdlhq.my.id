class Vector {
  constructor(capacity = 16) {
    let cap = 16;
    while (cap < capacity) cap *= 2;
    this.data = new Array(cap);
    this.count = 0;
  }

  size() { return this.count; }
  capacity() { return this.data.length; }
  isEmpty() { return this.count === 0; }

  at(i) {
    this.check(i, this.count - 1);
    return this.data[i];
  }

  push(x) { this.insert(this.count, x); }
  prepend(x) { this.insert(0, x); }

  insert(i, x) {
    this.check(i, this.count);
    if (this.count === this.data.length) this.resize(this.data.length * 2);
    for (let k = this.count; k > i; k--) this.data[k] = this.data[k - 1];
    this.data[i] = x;
    this.count++;
  }

  pop() {
    if (this.count === 0) throw new RangeError("Vector kosong");
    const x = this.data[this.count - 1];
    this.delete(this.count - 1);
    return x;
  }

  delete(i) {
    this.check(i, this.count - 1);
    for (let k = i; k < this.count - 1; k++) this.data[k] = this.data[k + 1];
    this.count--;
    this.data[this.count] = undefined;
    const cap = this.data.length;
    if (cap > 16 && this.count <= cap / 4) this.resize(cap / 2);
  }

  remove(x) {
    for (let k = this.count - 1; k >= 0; k--) if (this.data[k] === x) this.delete(k);
  }

  find(x) {
    for (let k = 0; k < this.count; k++) if (this.data[k] === x) return k;
    return -1;
  }

  check(i, max) {
    if (!Number.isInteger(i) || i < 0 || i > max) throw new RangeError("Indeks " + i + " di luar batas");
  }

  resize(cap) {
    const next = new Array(cap);
    for (let k = 0; k < this.count; k++) next[k] = this.data[k];
    this.data = next;
  }
}
