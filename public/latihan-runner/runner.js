/*
 * Isi iframe runner latihan. Iframe ini di-sandbox tanpa allow-same-origin, jadi originnya kosong:
 * kode pengunjung tidak bisa membaca cookie, localStorage, atau memanggil API situs. CSP rute ini juga memblokir semua koneksi.
 * Setiap run memakai worker baru dari harness.js (fdqHarness); halaman induk membuang iframe ini kalau melewati batas waktu.
 */
(function () {
  "use strict";
  var parentWin = window.parent;
  var target = location.origin;
  var source = "(" + fdqHarness.toString() + ")()";
  var worker = null;
  var MAX_CODE = 100000;

  function send(msg) {
    parentWin.postMessage(msg, target);
  }

  function makeWorker(code) {
    var url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
    try {
      return new Worker(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function validRun(d) {
    return d && typeof d === "object" && d.type === "run" && Number.isInteger(d.runId) &&
      typeof d.code === "string" && d.code.length <= MAX_CODE &&
      d.spec && typeof d.spec === "object" && typeof d.spec.kind === "string" && typeof d.spec.entry === "string" && Array.isArray(d.spec.tests);
  }

  function stop() {
    if (worker) worker.terminate();
    worker = null;
  }

  window.addEventListener("message", function (e) {
    if (e.source !== parentWin) return;
    var d = e.data;
    if (!validRun(d)) return;
    stop();
    var runId = d.runId;
    var w;
    try {
      w = makeWorker(source);
    } catch (err) {
      send({ type: "result", runId: runId, ok: false, error: "Browser ini tidak bisa menjalankan kode.", results: [], logs: [] });
      return;
    }
    worker = w;
    w.onmessage = function (ev) {
      var r = ev.data;
      if (worker !== w || !r || r.type !== "result" || r.runId !== runId) return;
      stop();
      send({ type: "result", runId: runId, ok: r.ok, error: r.error, results: r.results, logs: r.logs });
    };
    w.onerror = function (ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
      if (worker !== w) return;
      stop();
      send({ type: "result", runId: runId, ok: false, error: "Error: " + String((ev && ev.message) || "worker gagal"), results: [], logs: [] });
    };
    w.postMessage({ runId: runId, code: d.code, spec: d.spec });
  });

  // Cek sekali apakah browser ini bisa membuat worker blob di iframe sandbox
  var done = false;
  function ready(ok) {
    if (done) return;
    done = true;
    send({ type: "ready", workerOk: ok });
  }
  try {
    var probe = makeWorker("postMessage('pong')");
    probe.onmessage = function (ev) { probe.terminate(); ready(ev.data === "pong"); };
    probe.onerror = function () { probe.terminate(); ready(false); };
    setTimeout(function () { probe.terminate(); ready(false); }, 1000);
  } catch (err) {
    ready(false);
  }
})();
