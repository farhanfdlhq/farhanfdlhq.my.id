(function () {
  // Meja kerja: monitor, keyboard, mouse, router, dan casing PC. Scroll membawa kamera dari meja ke PC,
  // membuka panel samping, mengurai komponen, lalu membongkar CPU. Jaringan di belakang terus bertukar paket.
  var wrap = document.getElementById("scene"), canvas = document.getElementById("gl"), hud = document.getElementById("hud");
  if (!wrap || !canvas || !window.THREE) return;
  var T = window.THREE, renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" }); } catch (e) { return; }
  wrap.classList.add("gl-on");
  renderer.setClearColor(0x050505, 1);

  var ICE = new T.Color("#DDE6F0"), DIM = new T.Color("#4A5260"), RED = new T.Color("#FF4D3D");
  var mobile = (wrap.clientWidth || window.innerWidth) < 720;
  var scene = new T.Scene(); scene.fog = new T.FogExp2(0x050505, 0.04);
  var camera = new T.PerspectiveCamera(34, 1, 0.05, 160);
  var rand = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(31337);
  function V(x, y, z) { return new T.Vector3(x, y, z); }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function ease(t) { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function softDot(size, stops) {
    var c = document.createElement("canvas"); c.width = c.height = size;
    var x = c.getContext("2d"), g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); x.fillStyle = g; x.fillRect(0, 0, size, size);
    return new T.CanvasTexture(c);
  }
  var dotTex = softDot(64, [[0, "rgba(255,255,255,1)"], [0.3, "rgba(230,236,244,.75)"], [1, "rgba(200,210,225,0)"]]);
  var redTex = softDot(128, [[0, "rgba(255,130,110,.95)"], [0.25, "rgba(255,77,61,.45)"], [1, "rgba(255,77,61,0)"]]);
  function box(w, h, d, color, fill, parent) {
    var g = new T.Group(), geo = new T.BoxGeometry(w, h, d);
    g.add(new T.Mesh(geo, new T.MeshBasicMaterial({ color: fill || 0x0b0c0e })));
    var em = new T.LineBasicMaterial({ color: color.clone ? color.clone() : color, transparent: true });
    g.add(new T.LineSegments(new T.EdgesGeometry(geo), em)); g.userData.em = em;
    if (parent) parent.add(g); return g;
  }
  function lines(arr, color, parent, opacity) {
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(arr, 3));
    var l = new T.LineSegments(g, new T.LineBasicMaterial({ color: color, transparent: true, opacity: opacity == null ? 1 : opacity }));
    parent.add(l); return l;
  }
  function fan(r, parent, color, off) {
    var g = new T.Group();
    g.add(new T.Mesh(new T.RingGeometry(r * 0.86, r, 40), rgbMat(off || 0)));
    var inner = new T.Mesh(new T.CircleGeometry(r * 0.86, 32), new T.MeshBasicMaterial({ color: 0x0b0c0e, side: T.DoubleSide })); inner.position.z = -0.002; g.add(inner);
    var bl = []; for (var b = 0; b < 7; b++) { var a = b / 7 * Math.PI * 2, a2 = a + 0.5; bl.push(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15, 0, Math.cos(a2) * r * 0.86, Math.sin(a2) * r * 0.86, 0); }
    var blades = lines(bl, 0x8b929b, g); g.userData.blades = blades; parent.add(g); return g;
  }

  // ----- Lampu RGB: setiap item mendaftarkan dirinya, warnanya diputar setiap frame -----
  var rgb = [];                       // { mat, off } untuk satu warna; { geo, xs, speed } untuk gradien per titik
  var hsl = new T.Color();
  function rgbMat(off) { var m = new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide, transparent: true }); rgb.push({ mat: m, off: off }); return m; }
  function rgbLine(arr, parent, spread, off) {
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(arr, 3));
    var n = arr.length / 3, col = new Float32Array(n * 3), xs = new Float32Array(n);
    for (var i = 0; i < n; i++) xs[i] = (arr[i * 3] + arr[i * 3 + 2] * 0.5) * spread + (off || 0);
    g.setAttribute("color", new T.BufferAttribute(col, 3));
    var l = new T.LineSegments(g, new T.LineBasicMaterial({ vertexColors: true })); parent.add(l);
    rgb.push({ geo: g, xs: xs }); return l;
  }
  function rgbGlow(parent, pos, sx, sy, off) {
    var sp = new T.Sprite(new T.SpriteMaterial({ map: dotTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35, fog: false }));
    sp.position.copy(pos); sp.scale.set(sx, sy, 1); parent.add(sp); rgb.push({ mat: sp.material, off: off }); return sp;
  }

  // ----- Meja -----
  var desk = new T.Group(); scene.add(desk);
  box(7.2, 0.12, 3.2, DIM, 0x0a0b0d, desk).position.set(0, -0.06, 0);
  [[-3.4, -1.4], [3.4, -1.4], [-3.4, 1.4], [3.4, 1.4]].forEach(function (q) { box(0.1, 2.6, 0.1, DIM, 0x0a0b0d, desk).position.set(q[0], -1.42, q[1]); });
  (function () { var p = []; for (var x = -12; x <= 12; x += 0.6) for (var z = -10; z <= 6; z += 0.6) p.push(x, -2.72, z);
    var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(p, 3)); scene.add(new T.Points(g, new T.PointsMaterial({ color: 0x1c2027, size: 0.03 }))); })();

  // monitor dengan baris kode yang bergulir
  var mon = new T.Group(); mon.position.set(-0.7, 0, -0.75); desk.add(mon);
  box(0.9, 0.04, 0.5, ICE, null, mon).position.set(0, 0.02, 0.05);
  box(0.12, 0.8, 0.08, ICE, null, mon).position.set(0, 0.42, -0.05);
  var screen = box(3.0, 1.75, 0.08, ICE, 0x07080a, mon); screen.position.set(0, 1.5, 0);
  var CODE_N = 22, codeArr = new Float32Array(CODE_N * 6), codeGeo = new T.BufferGeometry(), code = [];
  for (var c = 0; c < CODE_N; c++) code.push({ ind: Math.floor(rand() * 4) * 0.14, len: 0.3 + rand() * 1.5, red: rand() < 0.12 });
  codeGeo.setAttribute("position", new T.BufferAttribute(codeArr, 3));
  var codeCol = new Float32Array(CODE_N * 6); code.forEach(function (l, i) { var col = l.red ? RED : (i % 3 ? DIM : ICE); for (var k = 0; k < 2; k++) codeCol.set([col.r, col.g, col.b], i * 6 + k * 3); });
  codeGeo.setAttribute("color", new T.BufferAttribute(codeCol, 3));
  var codeLines = new T.LineSegments(codeGeo, new T.LineBasicMaterial({ vertexColors: true })); codeLines.position.set(-1.35, 1.5, 0.045); mon.add(codeLines);
  var monGlow = new T.Sprite(new T.SpriteMaterial({ map: dotTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.12, fog: false }));
  monGlow.scale.set(4.4, 2.8, 1); monGlow.position.set(0, 1.5, 0.3); mon.add(monGlow);

  // keyboard, mouse, router
  var kb = box(1.9, 0.06, 0.6, ICE, null, desk); kb.position.set(-0.7, 0.03, 0.6);
  (function () { var a = []; for (var r = 0; r < 5; r++) for (var k = 0; k < 15; k++) { var x0 = -0.88 + k * 0.118, z0 = -0.24 + r * 0.11, w = 0.09; a.push(x0, 0.035, z0, x0 + w, 0.035, z0, x0 + w, 0.035, z0, x0 + w, 0.035, z0 + 0.08, x0 + w, 0.035, z0 + 0.08, x0, 0.035, z0 + 0.08, x0, 0.035, z0 + 0.08, x0, 0.035, z0); } rgbLine(a, kb, 0.35, 0); })();
  rgbGlow(kb, V(0, 0.02, 0), 2.4, 0.8, 0.1);
  var mouse = box(0.2, 0.06, 0.32, ICE, null, desk); mouse.position.set(0.75, 0.03, 0.65);
  rgbLine([-0.1, -0.025, -0.16, 0.1, -0.025, -0.16, 0.1, -0.025, -0.16, 0.1, -0.025, 0.16, 0.1, -0.025, 0.16, -0.1, -0.025, 0.16, -0.1, -0.025, 0.16, -0.1, -0.025, -0.16, 0, 0.032, -0.15, 0, 0.032, -0.02], mouse, 2.5, 0.3);
  rgbGlow(mouse, V(0, -0.02, 0), 0.6, 0.6, 0.3);
  // headset RGB tergantung di stand, satu paket diletakkan di atas casing PC (dipasang ke casing setelah casing dibuat)
  var hs = new T.Group();
  var TOP = 0.97, HOOK = 1.87;                                              // permukaan atas casing dan sandaran stand
  var standBase = new T.CylinderGeometry(0.17, 0.19, 0.04, 32);
  var sb = new T.Mesh(standBase, new T.MeshBasicMaterial({ color: 0x0b0c0e })); sb.position.y = TOP + 0.02; hs.add(sb);
  var sbe = new T.LineSegments(new T.EdgesGeometry(standBase, 20), new T.LineBasicMaterial({ color: 0xdde6f0 })); sbe.position.y = TOP + 0.02; hs.add(sbe);
  box(0.04, HOOK - TOP - 0.04, 0.04, ICE, null, hs).position.y = (TOP + 0.04 + HOOK) / 2;   // tiang
  box(0.045, 0.03, 0.24, ICE, null, hs).position.set(0, HOOK + 0.015, 0);                   // sandaran atas
  var HB = HOOK - 0.27, R = 0.27;                                           // headband bertumpu di sandaran
  var bandGeo = new T.TorusGeometry(R, 0.028, 8, 48, Math.PI);
  var band = new T.Mesh(bandGeo, new T.MeshBasicMaterial({ color: 0x0b0c0e })); band.position.y = HB; hs.add(band);
  var bandEdge = new T.LineSegments(new T.EdgesGeometry(bandGeo, 25), new T.LineBasicMaterial({ color: 0xdde6f0 })); bandEdge.position.y = HB; hs.add(bandEdge);
  var pad = new T.Mesh(new T.TorusGeometry(R - 0.035, 0.02, 6, 32, Math.PI * 0.5), new T.MeshBasicMaterial({ color: 0x2a2f37 })); pad.position.y = HB; pad.rotation.z = Math.PI * 0.25; hs.add(pad);
  [-1, 1].forEach(function (sd, i) {
    var cup = new T.Group(); cup.position.set(sd * (R + 0.02), HB - 0.12, 0); hs.add(cup);
    box(0.03, 0.12, 0.05, ICE, null, cup).position.set(0, 0.1, 0);       // sambungan ke headband
    var shellGeo = new T.CylinderGeometry(0.15, 0.15, 0.08, 32); shellGeo.rotateZ(Math.PI / 2);
    var shellM = new T.Mesh(shellGeo, new T.MeshBasicMaterial({ color: 0x0b0c0e })); shellM.position.y = -0.04; cup.add(shellM);
    var shellE = new T.LineSegments(new T.EdgesGeometry(shellGeo, 25), new T.LineBasicMaterial({ color: 0xdde6f0 })); shellE.position.y = -0.04; cup.add(shellE);
    var cushion = new T.Mesh(new T.TorusGeometry(0.115, 0.03, 8, 32), new T.MeshBasicMaterial({ color: 0x1b1f26 }));
    cushion.rotation.y = Math.PI / 2; cushion.position.set(-sd * 0.05, -0.04, 0); cup.add(cushion);
    var ring = new T.Mesh(new T.RingGeometry(0.075, 0.11, 36), rgbMat(0.5 + i * 0.2));
    ring.rotation.y = sd * Math.PI / 2; ring.position.set(sd * 0.042, -0.04, 0); cup.add(ring);
    rgbGlow(cup, V(sd * 0.09, -0.04, 0), 0.55, 0.55, 0.5 + i * 0.2);
  });
  // strip LED di tepi depan meja
  (function () { var a = []; for (var i = 0; i < 48; i++) { var x0 = -3.55 + i * 0.148; a.push(x0, -0.05, 1.605, x0 + 0.148, -0.05, 1.605); } rgbLine(a, desk, 0.12, 0); })();
  var router = box(0.6, 0.1, 0.32, ICE, null, desk); router.position.set(-3.0, 0.05, -0.9);
  lines([-0.22, 0.05, -0.1, -0.28, 0.6, -0.12, 0.22, 0.05, -0.1, 0.28, 0.6, -0.12], 0xdde6f0, router);
  var rLeds = []; for (var rl = 0; rl < 4; rl++) { var led = new T.Mesh(new T.PlaneGeometry(0.035, 0.02), new T.MeshBasicMaterial({ color: 0x6fcf97 })); led.position.set(-0.18 + rl * 0.08, 0, 0.161); router.add(led); rLeds.push(led); }

  // ----- Casing PC dan isinya -----
  var tower = new T.Group(); tower.position.set(2.35, 0.97, -0.5); desk.add(tower);
  hs.position.set(-0.3, 0, -0.02); hs.rotation.y = 0.12; tower.add(hs);
  var shell = new T.Group(); tower.add(shell);
  box(1.8, 0.03, 0.85, ICE, null, shell).position.set(0, 0.955, 0);     // atas
  box(1.8, 0.03, 0.85, ICE, null, shell).position.set(0, -0.955, 0);    // bawah
  box(1.8, 1.94, 0.02, ICE, null, shell).position.set(0, 0, -0.415);    // dinding belakang
  var front = box(0.03, 1.94, 0.85, ICE, null, shell); front.position.set(0.9, 0, 0);
  (function () { var a = []; for (var v = 0; v < 12; v++) { var y = -0.7 + v * 0.1; a.push(0.92, y, -0.3, 0.92, y, 0.3); } lines(a, 0x4a5260, shell); })();
  var power = new T.Mesh(new T.CircleGeometry(0.035, 16), new T.MeshBasicMaterial({ color: 0xff4d3d })); power.rotation.y = Math.PI / 2; power.position.set(0.92, 0.82, 0.25); shell.add(power);
  var side = box(1.8, 1.94, 0.02, ICE, 0x0b0c0e, tower); side.position.set(0, 0, 0.425);
  // nama domain timbul samar di panel samping
  var plateCanvas = document.createElement("canvas"); plateCanvas.width = 1024; plateCanvas.height = 160;
  var plateTex = new T.CanvasTexture(plateCanvas); plateTex.anisotropy = 4;
  function drawPlate() {
    var x = plateCanvas.getContext("2d"), txt = "farhanfdlhq.my.id";
    x.clearRect(0, 0, 1024, 160);
    x.font = "700 92px Archivo, 'Helvetica Neue', Arial, sans-serif";
    try { x.letterSpacing = "1px"; } catch (e) {}
    x.textBaseline = "middle"; x.textAlign = "center";
    x.fillStyle = "rgba(0,0,0,.9)"; x.fillText(txt, 514, 84);              // bayangan bawah-kanan
    x.fillStyle = "rgba(221,230,240,.22)"; x.fillText(txt, 510, 78);       // sorot atas-kiri
    x.fillStyle = "#1a1e24"; x.fillText(txt, 512, 81);                     // permukaan huruf
    plateTex.needsUpdate = true;
  }
  drawPlate(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPlate);
  var plate = new T.Mesh(new T.PlaneGeometry(1.5, 0.234), new T.MeshBasicMaterial({ map: plateTex, transparent: true, depthWrite: false }));
  plate.position.set(0, 0, 0.0115); side.add(plate);
  var parts = {};
  function comp(name, obj, home, out) { obj.position.copy(home); tower.add(obj); parts[name] = { o: obj, home: home.clone(), out: out }; return obj; }
  var mb = comp("mb", box(1.45, 1.55, 0.02, ICE, 0x0d1013), V(-0.1, 0.12, -0.38), V(0, 0, 0.35));
  (function () { var a = []; for (var i = 0; i < 22; i++) { var y = -0.6 + i * 0.055; a.push(-0.65, y, 0.012, -0.2 + Math.sin(i * 1.7) * 0.25, y, 0.012); }
    for (var j = 0; j < 10; j++) { var x = 0.1 + j * 0.05; a.push(x, -0.7, 0.012, x, -0.35, 0.012); } lines(a, 0x3a414c, mb); })();
  // CPU: substrat dengan pin, IHS, dan die merah
  var cpu = new T.Group(); comp("cpu", cpu, V(-0.12, 0.42, -0.355), V(0, 0, 0.55));
  var sub = box(0.34, 0.34, 0.025, ICE, 0x101318, cpu);
  (function () { var p = []; for (var i = 0; i < 12; i++) for (var j = 0; j < 12; j++) p.push(-0.15 + i * 0.0273, -0.15 + j * 0.0273, -0.014); var g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(p, 3)); sub.add(new T.Points(g, new T.PointsMaterial({ color: 0xdde6f0, size: 0.012 }))); })();
  var die = box(0.15, 0.15, 0.012, RED, 0x2a0b08, cpu); die.position.z = 0.02;
  var dieGlow = new T.Sprite(new T.SpriteMaterial({ map: redTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5, fog: false })); dieGlow.scale.set(0.5, 0.5, 1); die.add(dieGlow);
  var ihs = box(0.29, 0.29, 0.035, ICE, 0x15181d, cpu); ihs.position.z = 0.045;
  // pendingin CPU: heatsink dan kipas
  var cooler = new T.Group(); comp("cooler", cooler, V(-0.12, 0.42, -0.13), V(-0.7, 0.25, 0.85));
  box(0.5, 0.55, 0.36, DIM, 0x0b0c0e, cooler);
  (function () { var a = []; for (var f = 0; f < 14; f++) { var x = -0.23 + f * 0.035; a.push(x, -0.27, 0.181, x, 0.27, 0.181); } lines(a, 0x8b929b, cooler); })();
  var cfan = fan(0.24, cooler); cfan.position.set(0, 0, 0.19);
  // RAM
  var ram = new T.Group(); comp("ram", ram, V(0.36, 0.42, -0.31), V(0.55, 0.1, 0.8));
  for (var m = 0; m < 4; m++) { box(0.03, 0.6, 0.13, ICE, null, ram).position.set(m * 0.06, 0, 0.065); var bar = new T.Mesh(new T.BoxGeometry(0.032, 0.04, 0.12), rgbMat(m * 0.08)); bar.position.set(m * 0.06, 0.3, 0.065); ram.add(bar); }
  // GPU dengan dua kipas
  var gpu = new T.Group(); comp("gpu", gpu, V(-0.12, -0.24, -0.15), V(0, -0.15, 0.85));
  box(1.15, 0.13, 0.42, ICE, 0x0b0c0e, gpu);
  [-0.27, 0.27].forEach(function (x) { var gf = fan(0.15, gpu); gf.rotation.x = -Math.PI / 2; gf.position.set(x, -0.066, 0); });
  box(0.9, 0.01, 0.36, RED, 0x0b0c0e, gpu).position.set(0, 0.07, 0);
  // PSU, SSD, kipas casing
  comp("psu", box(0.62, 0.36, 0.72, DIM), V(-0.55, -0.74, -0.03), V(-0.2, -0.2, 0.55));
  comp("ssd", box(0.28, 0.1, 0.03, ICE), V(0.25, -0.02, -0.355), V(0.35, 0, 0.75));
  rgbLine([0.925, -0.9, 0.36, 0.925, 0.9, 0.36, 0.925, -0.9, -0.36, 0.925, 0.9, -0.36], tower, 0.6, 0);
  var caseFans = []; [0.35, -0.15].forEach(function (y, fi) { var f = fan(0.2, tower, null, fi * 0.15); f.rotation.y = Math.PI / 2; f.position.set(0.86, y, 0); caseFans.push(f); });
  var pcGlow = new T.Sprite(new T.SpriteMaterial({ map: redTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false })); pcGlow.scale.set(1.4, 1.4, 1); tower.add(pcGlow);

  // ----- Jaringan -----
  var packets = [];
  function addPk(curve, n, speed, group, inner) { for (var q = 0; q < n; q++) packets.push({ c: curve, t: rand(), s: speed * (0.8 + rand() * 0.5), d: q % 2 ? -1 : 1, g: group, inner: inner }); }
  var cable = [];
  function pushCurve(cv) { var pts = cv.getPoints(48); for (var i = 1; i < pts.length; i++) cable.push(pts[i - 1].x, pts[i - 1].y, pts[i - 1].z, pts[i].x, pts[i].y, pts[i].z); }
  var rPos = V(-3.0, 0.1, -1.06), pcBack = V(1.6, 0.25, -0.95);
  var lan = new T.CubicBezierCurve3(rPos, V(-2.4, 0.01, -1.35), V(0.5, 0.01, -1.45), pcBack); pushCurve(lan); addPk(lan, 4, 0.18, null, false);
  var nodes = [], NN = mobile ? 6 : 8;
  for (var n = 0; n < NN; n++) {
    var pos = V(-6.5 + n * (13 / (NN - 1)) + (rand() - 0.5), 1.2 + rand() * 3.6, -6.5 - rand() * 4);
    var isProj = n % 2 === 0 && n / 2 < 4, geo = isProj ? new T.BoxGeometry(0.5, 0.5, 0.5) : new T.OctahedronGeometry(0.24);
    var g = new T.Group(); g.position.copy(pos); g.add(new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0x0b0c0e })));
    var em = new T.LineBasicMaterial({ color: (isProj ? ICE : DIM).clone() }); g.add(new T.LineSegments(new T.EdgesGeometry(geo), em));
    var halo = new T.Sprite(new T.SpriteMaterial({ map: redTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false })); halo.scale.set(1.8, 1.8, 1); g.add(halo);
    scene.add(g); nodes.push({ g: g, em: em, base: (isProj ? ICE : DIM).clone(), halo: halo, pos: pos, proj: isProj ? n / 2 : -1, spin: 0.2 + rand() * 0.4 });
  }
  var antenna = V(-3.28, 0.65, -1.02);
  nodes.forEach(function (nd, i) {
    var mid = antenna.clone().lerp(nd.pos, 0.5); mid.y += 1.2;
    var cv = new T.QuadraticBezierCurve3(antenna.clone(), mid, nd.pos.clone()); pushCurve(cv); addPk(cv, nd.proj >= 0 ? 3 : 2, 0.14, nd.proj >= 0 ? nd.proj : null, false);
    if (i < NN - 1) { var b = nodes[i + 1].pos, m2 = nd.pos.clone().lerp(b, 0.5); m2.y += 0.6; var c2 = new T.QuadraticBezierCurve3(nd.pos.clone(), m2, b.clone()); pushCurve(c2); addPk(c2, 1, 0.1, null, false); }
  });
  var cg = new T.BufferGeometry(); cg.setAttribute("position", new T.Float32BufferAttribute(cable, 3));
  scene.add(new T.LineSegments(cg, new T.LineBasicMaterial({ color: 0x3a414c, transparent: true, opacity: 0.85 })));
  // jalur data di dalam PC: CPU ke RAM, GPU, dan SSD
  var innerPairs = [["cpu", "ram"], ["cpu", "gpu"], ["cpu", "ssd"], ["gpu", "psu"]];
  var innerArr = new Float32Array(innerPairs.length * 6), innerGeo = new T.BufferGeometry(); innerGeo.setAttribute("position", new T.BufferAttribute(innerArr, 3));
  var innerMat = new T.LineBasicMaterial({ color: 0xff4d3d, transparent: true, opacity: 0 }); scene.add(new T.LineSegments(innerGeo, innerMat));
  var innerCurves = innerPairs.map(function () { return new T.LineCurve3(V(0, 0, 0), V(0, 0, 0)); });
  innerCurves.forEach(function (cv) { addPk(cv, 2, 0.6, null, true); });
  var pkPos = new Float32Array(packets.length * 3), pkGeo = new T.BufferGeometry(); pkGeo.setAttribute("position", new T.BufferAttribute(pkPos, 3));
  scene.add(new T.Points(pkGeo, new T.PointsMaterial({ map: dotTex, size: mobile ? 0.2 : 0.16, color: 0xe6ecf4, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })));
  (function () { var N = mobile ? 220 : 440, a = new Float32Array(N * 3); for (var d = 0; d < N; d++) { a[d * 3] = (rand() - 0.5) * 40; a[d * 3 + 1] = -2 + rand() * 10; a[d * 3 + 2] = -16 + rand() * 20; }
    var g2 = new T.BufferGeometry(); g2.setAttribute("position", new T.BufferAttribute(a, 3)); scene.add(new T.Points(g2, new T.PointsMaterial({ size: 0.03, color: 0x8b929b, transparent: true, opacity: 0.4, depthWrite: false }))); })();

  // ----- Alur scroll -----
  var STOPS = [["hero", "#hero", "desk"], ["pc", "#beat-pc", "pc"], ["proyek", "#proyek", "pc"], ["open", "#beat-open", "open"], ["about", "#h-about", "open"],
               ["explode", "#beat-explode", "explode"], ["exp", "#h-exp", "explode"], ["cpu", "#beat-cpu", "cpu"], ["skill", "#h-skill", "cpu"], ["kontak", "#kontak", "back"]];
  var HUD = { desk: ["00", "Meja", "Desk"], pc: ["01", "PC", "PC"], open: ["02", "Panel samping", "Side panel"], explode: ["03", "Komponen", "Components"], cpu: ["04", "CPU", "CPU"], back: ["05", "Meja", "Desk"], detail: ["›", "Proyek", "Project"] };
  var WIDE = {
    desk: [V(5.4, 3.6, 9.0), V(1.25, 0.8, -0.5)], pc: [V(5.4, 2.5, 4.0), V(2.35, 1.2, -0.5)], open: [V(3.5, 1.9, 3.7), V(2.2, 0.95, -0.6)],
    explode: [V(4.3, 2.3, 5.1), V(2.2, 1.0, 0.0)], cpu: [V(3.05, 1.95, 1.45), V(2.2, 1.45, -0.3)], back: [V(6.0, 4.0, 10.2), V(1.25, 0.8, -0.5)],
    detail: [V(-0.2, 1.7, 2.9), V(-0.7, 1.45, -0.7)]
  };
  var NARROW = {
    desk: [V(5.4, 5.2, 13.5), V(0.6, 0.4, -0.5)], pc: [V(5.8, 2.9, 6.0), V(2.35, 1.2, -0.5)], open: [V(3.7, 2.2, 5.2), V(2.2, 0.95, -0.6)],
    explode: [V(4.6, 2.6, 7.0), V(2.2, 0.95, 0.0)], cpu: [V(3.0, 2.1, 2.1), V(2.2, 1.45, -0.3)], back: [V(6.0, 5.6, 14.5), V(0.6, 0.4, -0.5)],
    detail: [V(-0.3, 1.9, 4.6), V(-0.7, 1.45, -0.7)]
  };
  var P = WIDE, stops = [], narrow = false;
  function anchors() {
    stops = [];
    if (location.hash === "#agendain") return;
    STOPS.forEach(function (s, i) {
      var el = document.querySelector(s[1]); if (!el) return;
      var sec = el.closest("section") || el, r = sec.getBoundingClientRect();
      stops.push({ i: i, cam: s[2], y: r.top + window.scrollY + r.height / 2 });
    });
  }
  function layout() {
    var w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)); renderer.setSize(w, h, false);
    camera.aspect = w / h; narrow = camera.aspect < 0.9; P = narrow ? NARROW : WIDE; anchors();
  }
  layout();
  if ("ResizeObserver" in window) { var ro = new ResizeObserver(layout); ro.observe(wrap); ro.observe(document.body); }
  window.addEventListener("resize", layout); window.addEventListener("mockroute", function () { setTimeout(anchors, 50); }); window.addEventListener("load", anchors);

  var want = { pos: V(0, 0, 0), look: V(0, 0, 0), p: 0 }, cam = { pos: V(0, 0, 0), look: V(0, 0, 0), p: 0 }, snap = true, hudKey = "desk";
  function target() {
    if (location.hash === "#agendain") { want.pos.copy(P.detail[0]); want.look.copy(P.detail[1]); want.p = 0; hudKey = "detail"; return; }
    if (!stops.length) { want.pos.copy(P.desk[0]); want.look.copy(P.desk[1]); want.p = 0; hudKey = "desk"; return; }
    var y = window.scrollY + window.innerHeight * 0.5, i = 0;
    while (i < stops.length - 1 && y > stops[i + 1].y) i++;
    var a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
    var t = a === b ? 0 : clamp((y - a.y) / (b.y - a.y)); if (y < stops[0].y) t = 0;
    var st = t * t * (3 - 2 * t);
    want.pos.copy(P[a.cam][0]).lerp(P[b.cam][0], st); want.look.copy(P[a.cam][1]).lerp(P[b.cam][1], st);
    want.p = a.i + t; hudKey = (t < 0.5 ? a : b).cam;
  }

  var hovered = null, inView = null, HOSTS = { agendain: 0, qiran: 1, bynana: 2, andiamo: 3 };
  document.querySelectorAll(".proj[data-host]").forEach(function (el) {
    el.addEventListener("pointerenter", function () { hovered = HOSTS[el.dataset.host]; });
    el.addEventListener("pointerleave", function () { hovered = null; });
    el.addEventListener("focusin", function () { hovered = HOSTS[el.dataset.host]; });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) inView = HOSTS[en.target.dataset.host]; }); }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll(".proj[data-host]").forEach(function (el) { io.observe(el); });
  }
  var px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", function (ev) { tx = (ev.clientX / window.innerWidth - 0.5) * 2; ty = (ev.clientY / window.innerHeight - 0.5) * 2; });
  function lang() { return document.documentElement.lang === "en" ? "en" : "id"; }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = performance.now(), lastT = t0, running = false, lastHud = "", tmp = V(0, 0, 0), wa = V(0, 0, 0), wb = V(0, 0, 0);
  function frame(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; var time = (now - t0) / 1000;
    target();
    var k = (reduce || snap) ? 1 : 1 - Math.pow(0.002, dt); snap = false;
    cam.pos.lerp(want.pos, k); cam.look.lerp(want.look, k); cam.p += (want.p - cam.p) * k;
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    var close = clamp((cam.p - 6) / 1.2);                                   // saat dekat CPU, parallax diperkecil
    camera.position.set(cam.pos.x + px * 0.4 * (1 - close * 0.85), cam.pos.y - py * 0.25 * (1 - close * 0.85), cam.pos.z);
    camera.lookAt(cam.look);
    // geser bidang pandang: di desktop objek di kanan (isi di kiri), di HP hero sedikit ke atas
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (!narrow) camera.setViewOffset(w, h, -0.2 * w, 0, w, h);
    else camera.setViewOffset(w, h, 0, 0.17 * h * (1 - clamp(cam.p)) + 0.17 * h * clamp(cam.p - 8), w, h);
    camera.updateProjectionMatrix();

    var p = cam.p, back = ease(p - 8);
    var open = ease(p - 2) * (1 - back), expl = ease(p - 4) * (1 - back), deep = ease(p - 6) * (1 - back);
    side.position.set(open * 2.6, -open * 0.5, 0.425 + open * 0.45); side.rotation.y = -open * 1.0; side.userData.em.opacity = 1 - open * 0.6;
    Object.keys(parts).forEach(function (name) {
      var pt = parts[name]; pt.o.position.copy(pt.home).addScaledVector(pt.out, expl);
    });
    parts.cooler.o.position.y += deep * 1.5; parts.cooler.o.position.x -= deep * 0.4;
    ihs.position.set(-deep * 0.12, deep * 0.36, 0.045 + deep * 0.22); sub.position.z = -deep * 0.1; die.position.z = 0.02 + deep * 0.08;
    dieGlow.material.opacity = 0.3 + deep * 0.35;
    pcGlow.position.copy(parts.cpu.o.position); pcGlow.material.opacity = open * 0.35;
    innerMat.opacity = expl * 0.7;
    innerPairs.forEach(function (ip, i) {
      parts[ip[0]].o.getWorldPosition(wa); parts[ip[1]].o.getWorldPosition(wb);
      innerArr.set([wa.x, wa.y, wa.z, wb.x, wb.y, wb.z], i * 6); innerCurves[i].v1.copy(wa); innerCurves[i].v2.copy(wb);
    });
    innerGeo.attributes.position.needsUpdate = true;

    var hueT = reduce ? 0 : time * 0.12;
    rgb.forEach(function (r) {
      if (r.mat) { hsl.setHSL(((hueT + r.off) % 1 + 1) % 1, 1, 0.56); r.mat.color.copy(hsl); }
      else { var c = r.geo.attributes.color.array; for (var i = 0; i < r.xs.length; i++) { hsl.setHSL(((hueT + r.xs[i]) % 1 + 1) % 1, 1, 0.58); c[i * 3] = hsl.r; c[i * 3 + 1] = hsl.g; c[i * 3 + 2] = hsl.b; } r.geo.attributes.color.needsUpdate = true; }
    });
    if (!reduce) {
      [cfan].concat(caseFans).forEach(function (f, i) { f.userData.blades.rotation.z = time * (4 + i); });
      gpu.children.forEach(function (ch) { if (ch.userData.blades) ch.userData.blades.rotation.z = -time * 5; });
      rLeds.forEach(function (l, i) { l.material.color.setHex(Math.sin(time * (3 + i * 1.7) + i) > 0.2 ? 0x6fcf97 : 0x1d3b2b); });
      power.material.color.setHex(Math.sin(time * 1.5) > -0.6 ? 0xff4d3d : 0x5a1a14);
    }
    var sp = 0.085, top = 0.78;
    code.forEach(function (l, i) {
      var y = top - ((i * sp + (reduce ? 0 : time * 0.12)) % (CODE_N * sp));
      var vis = y > -0.78 ? 1 : 0;
      codeArr.set([l.ind, y, 0, l.ind + Math.min(l.len, 2.6 - l.ind) * vis, y, 0], i * 6);
    });
    codeGeo.attributes.position.needsUpdate = true;

    var hot = hovered != null ? hovered : (location.hash === "#agendain" ? 0 : (hudKey === "pc" ? inView : null));
    nodes.forEach(function (nd) {
      var on = nd.proj >= 0 && nd.proj === hot ? 1 : 0; nd.h = (nd.h || 0) + (on - (nd.h || 0)) * (reduce ? 1 : 0.08);
      nd.em.color.copy(nd.base).lerp(RED, nd.h); nd.halo.material.opacity = nd.h * 0.9;
      if (!reduce) { nd.g.rotation.y += dt * nd.spin; nd.g.rotation.x += dt * nd.spin * 0.5; }
    });
    for (var i = 0; i < packets.length; i++) {
      var pk = packets[i], boost = (pk.g != null && pk.g === hot) ? 2.6 : 1;
      if (!reduce) pk.t = (pk.t + dt * pk.s * boost) % 1;
      if (pk.inner && expl < 0.05) { pkPos[i * 3 + 1] = -99; continue; }
      pk.c.getPoint(pk.d > 0 ? pk.t : 1 - pk.t, tmp); pkPos[i * 3] = tmp.x; pkPos[i * 3 + 1] = tmp.y; pkPos[i * 3 + 2] = tmp.z;
    }
    pkGeo.attributes.position.needsUpdate = true;

    if (hud) { var lab = HUD[hudKey], key = hudKey + lang(); if (key !== lastHud) { lastHud = key; hud.querySelector(".i").textContent = lab[0]; hud.querySelector(".n").textContent = lang() === "en" ? lab[2] : lab[1]; } }
    renderer.render(scene, camera);
  }
  function loop(now) { if (document.hidden) { running = false; return; } frame(now); requestAnimationFrame(loop); }
  function start() { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(loop); } }
  var pending = false;
  function draw() { if (!pending) { pending = true; requestAnimationFrame(function (n) { pending = false; frame(n); }); } }
  if (reduce) { window.addEventListener("scroll", draw, { passive: true }); window.addEventListener("mockroute", draw); window.addEventListener("resize", draw); draw(); }
  else { document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); }); start(); }
})();
