function permutations(s) {
  const letters = s.split("").sort();
  const used = new Array(letters.length).fill(false);
  const out = [];
  const cur = [];
  function build() {
    if (cur.length === letters.length) return void out.push(cur.join(""));
    for (let i = 0; i < letters.length; i++) {
      if (used[i]) continue;
      if (i > 0 && letters[i] === letters[i - 1] && !used[i - 1]) continue;
      used[i] = true;
      cur.push(letters[i]);
      build();
      cur.pop();
      used[i] = false;
    }
  }
  build();
  return out;
}
