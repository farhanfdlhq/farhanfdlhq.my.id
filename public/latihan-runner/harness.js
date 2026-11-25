/*
 * Penilai jawaban latihan coding.
 * Satu fungsi mandiri tanpa referensi ke luar dirinya: runner.js menjadikan fdqHarness.toString() isi worker blob,
 * dan Vitest menjalankannya lewat vm untuk membuktikan setiap solusi acuan lulus. Jangan menambah apa pun di luar fungsi ini.
 */
// eslint-disable-next-line no-unused-vars
function fdqHarness() {
  "use strict";
  var MAX = 2000;
  var MAX_LOGS = 200;
  // Disimpan sebelum kode pengunjung jalan, karena kode itu bisa menimpa JSON, prototipe array, dan lainnya.
  var stringify = JSON.stringify;
  var parse = JSON.parse;
  var isArray = Array.isArray;
  var keys = Object.keys;
  var getProto = Object.getPrototypeOf;
  var objProto = Object.prototype;
  var apply = Reflect.apply;
  var strSlice = String.prototype.slice;
  var arrSlice = Array.prototype.slice;
  var hasOwn = Object.prototype.hasOwnProperty;
  var construct = Reflect.construct;
  var reTest = RegExp.prototype.test;
  var Str = String;
  var Fn = Function;
  var isFinite_ = Number.isFinite;
  var ENTRY_RE = /^[A-Za-z_$][\w$]*$/;
  var BAD = {};

  function cut(s) {
    return s.length > MAX ? apply(strSlice, s, [0, MAX]) + "…" : s;
  }

  // Teks untuk ditampilkan. Aman untuk siklus, BigInt, Symbol, dan nilai besar (berhenti setelah MAX karakter).
  function fmt(v, top) {
    var out = { s: "" };
    var seen = [];
    function add(x) { out.s += x; return out.s.length <= MAX; }
    function walk(x) {
      if (out.s.length > MAX) return false;
      if (x === undefined) return add("undefined");
      if (x === null) return add("null");
      var t = typeof x;
      if (t === "string") return add(top && seen.length === 0 && out.s === "" ? x : stringify(x));
      if (t === "number" || t === "boolean") return add(Str(x));
      if (t === "bigint") return add(Str(x) + "n");
      if (t === "symbol") { try { return add(x.toString()); } catch (e) { return add("Symbol()"); } }
      if (t === "function") return add("[Function]");
      for (var i = 0; i < seen.length; i++) if (seen[i] === x) return add("[Circular]");
      seen[seen.length] = x;
      var ok = true;
      if (isArray(x)) {
        add("[");
        for (var j = 0; j < x.length && ok; j++) { if (j) add(","); ok = walk(x[j]); }
        if (ok) add("]");
      } else {
        var ks;
        try { ks = keys(x); } catch (e) { ks = []; }
        add("{");
        for (var k = 0; k < ks.length && ok; k++) {
          if (k) add(",");
          add(stringify(ks[k]) + ":");
          var val;
          try { val = x[ks[k]]; } catch (e) { val = "[Error]"; }
          ok = walk(val);
        }
        if (ok) add("}");
      }
      seen.length--;
      return ok && out.s.length <= MAX;
    }
    try { walk(v); } catch (e) { out.s += "?"; }
    return cut(out.s);
  }

  function errText(e) {
    try {
      if (e && typeof e === "object" && typeof e.name === "string") return cut(e.name + ": " + Str(e.message));
    } catch (x) { /* getter yang melempar */ }
    return cut("Thrown: " + fmt(e));
  }

  // Ubah hasil ke nilai JSON. Nilai yang tidak bisa (BigInt, fungsi, siklus, NaN, instance kelas) menjadi BAD.
  function norm(v, seen) {
    if (v === undefined || v === null) return null;
    var t = typeof v;
    if (t === "string" || t === "boolean") return v;
    if (t === "number") return isFinite_(v) ? v : BAD;
    if (t !== "object") return BAD;
    for (var i = 0; i < seen.length; i++) if (seen[i] === v) return BAD;
    seen[seen.length] = v;
    var res;
    if (isArray(v)) {
      res = [];
      for (var j = 0; j < v.length; j++) {
        var n = norm(v[j], seen);
        if (n === BAD) { seen.length--; return BAD; }
        res[j] = n;
      }
    } else {
      var p = getProto(v);
      if (p !== objProto && p !== null) { seen.length--; return BAD; }
      res = {};
      var ks = keys(v);
      for (var k = 0; k < ks.length; k++) {
        var m = norm(v[ks[k]], seen);
        if (m === BAD) { seen.length--; return BAD; }
        res[ks[k]] = m;
      }
    }
    seen.length--;
    return res;
  }

  function eq(a, b, unordered) {
    if (a === BAD) return false;
    if (a === b) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
    if (isArray(a) !== isArray(b)) return false;
    if (isArray(a)) {
      if (a.length !== b.length) return false;
      if (!unordered) {
        for (var i = 0; i < a.length; i++) if (!eq(a[i], b[i], false)) return false;
        return true;
      }
      var used = [];
      for (var x = 0; x < b.length; x++) {
        var found = false;
        for (var y = 0; y < a.length; y++) {
          if (!used[y] && eq(a[y], b[x], true)) { used[y] = true; found = true; break; }
        }
        if (!found) return false;
      }
      return true;
    }
    var ka = keys(a), kb = keys(b);
    if (ka.length !== kb.length) return false;
    for (var k = 0; k < kb.length; k++) {
      if (!apply(hasOwn, a, [kb[k]])) return false;
      if (!eq(a[kb[k]], b[kb[k]], unordered)) return false;
    }
    return true;
  }

  function clone(v) {
    return v === undefined ? undefined : parse(stringify(v));
  }

  function grade(code, spec) {
    var logs = [];
    function log() {
      if (logs.length >= MAX_LOGS) return;
      var parts = "";
      for (var i = 0; i < arguments.length; i++) parts += (i ? " " : "") + fmt(arguments[i], true);
      logs[logs.length] = cut(parts);
    }
    var fakeConsole = { log: log, info: log, warn: log, error: log, debug: log };
    var fail = function (msg) { return { ok: false, error: cut(msg), results: [], logs: logs }; };

    if (typeof code !== "string" || !spec || typeof spec.entry !== "string" || !isArray(spec.tests)) return fail("Data soal tidak lengkap.");
    var entry = spec.entry;
    if (!apply(reTest, ENTRY_RE, [entry])) return fail("Nama fungsi soal tidak valid: " + entry);
    var tests = clone(spec.tests);
    var kind = spec.kind;

    var target;
    try {
      var factory = new Fn("console", code + "\n;return typeof " + entry + " !== 'undefined' ? " + entry + " : undefined;");
      target = factory(fakeConsole);
    } catch (e) {
      return fail(errText(e));
    }
    if (typeof target !== "function") return fail("Tidak menemukan " + (kind === "class" ? "class " : "function ") + entry + ".");

    var results = [];
    var allPass = true;
    for (var t = 0; t < tests.length; t++) {
      var r = kind === "class" ? runClass(target, tests[t]) : runFunction(target, tests[t]);
      if (!r.pass) allPass = false;
      results[results.length] = r;
    }
    return { ok: allPass, results: results, logs: logs };
  }

  function runFunction(fn, test) {
    var out;
    try {
      out = apply(fn, undefined, clone(test.args) || []);
    } catch (e) {
      return test.throws ? { pass: true } : { pass: false, error: errText(e) };
    }
    if (test.throws) return { pass: false, got: fmt(out) };
    var n;
    try { n = norm(out, []); } catch (e) { n = BAD; }
    return eq(n, test.expected === undefined ? null : test.expected, !!test.unordered) ? { pass: true } : { pass: false, got: fmt(out) };
  }

  function runClass(Cls, test) {
    var ops = test.ops, expected = test.expected, obj;
    try {
      obj = construct(Cls, clone(apply(arrSlice, ops[0], [1])) || []);
    } catch (e) {
      return { pass: false, error: errText(e) };
    }
    for (var i = 1; i < ops.length; i++) {
      var name = ops[i][0];
      var args = clone(apply(arrSlice, ops[i], [1])) || [];
      var label = name + "(" + apply(strSlice, fmt(args), [1, -1]) + ")";
      var want = expected[i];
      var wantThrow = want !== null && typeof want === "object" && !isArray(want) && want.throws === true && keys(want).length === 1;
      var method;
      try { method = obj[name]; } catch (e) { method = undefined; }
      if (typeof method !== "function") return { pass: false, error: cut("Metode " + name + " tidak ada.") };
      var out;
      try {
        out = apply(method, obj, args);
      } catch (e) {
        if (wantThrow) continue;
        return { pass: false, error: cut(label + ": " + errText(e)) };
      }
      if (wantThrow) return { pass: false, got: cut(label + " → " + fmt(out) + " (seharusnya melempar error)") };
      var n;
      try { n = norm(out, []); } catch (e) { n = BAD; }
      if (!eq(n, want, false)) return { pass: false, got: cut(label + " → " + fmt(out)) };
    }
    return { pass: true };
  }

  if (typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" && self instanceof WorkerGlobalScope) {
    var post = self.postMessage.bind(self);
    self.onmessage = function (e) {
      var d = e.data || {};
      var r = grade(d.code, d.spec);
      post({ type: "result", runId: d.runId, ok: r.ok, error: r.error, results: r.results, logs: r.logs });
    };
  }

  return { grade: grade };
}
