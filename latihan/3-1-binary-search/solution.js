function binarySearch(arr, x) {
  let lo = 0;
  let hi = arr.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < x) lo = mid + 1;
    else {
      if (arr[mid] === x) found = mid;
      hi = mid - 1;
    }
  }
  return found;
}
