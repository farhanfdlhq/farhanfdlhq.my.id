class Queue {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }

  enqueue(x) {
    this.inbox.push(x);
  }

  dequeue() {
    this.fill();
    if (this.outbox.length === 0) throw new RangeError("Queue kosong");
    return this.outbox.pop();
  }

  peek() {
    this.fill();
    return this.outbox.length ? this.outbox[this.outbox.length - 1] : null;
  }

  size() {
    return this.inbox.length + this.outbox.length;
  }

  fill() {
    if (this.outbox.length === 0) while (this.inbox.length) this.outbox.push(this.inbox.pop());
  }
}
