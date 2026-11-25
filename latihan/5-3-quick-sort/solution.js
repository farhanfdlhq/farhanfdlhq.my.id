function quickSort(arr) {
  if (arr.length <= 1) return arr.slice();
  const pivot = arr[arr.length >> 1];
  const less = [];
  const same = [];
  const more = [];
  for (const x of arr) {
    if (x < pivot) less.push(x);
    else if (x > pivot) more.push(x);
    else same.push(x);
  }
  return [...quickSort(less), ...same, ...quickSort(more)];
}
