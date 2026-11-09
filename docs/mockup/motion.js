(function () {
  var EN = {
    hero_who: "<b>UI/UX | Software Engineer</b> in Bogor, Indonesia. Scroll to take apart the computer on this desk: each component opens one part of my work.",
    peek_hint: "Scroll to take it apart. Tap the eye icon to come back.",
    see: 'See projects <span class="arr">›</span>',
    nav_projects: "Projects", nav_about: "About", nav_contact: "Contact", t_dark: "Dark", t_light: "Light",
    summary: "I build web applications from database design to production release: ISP billing, cross-border e-commerce, an LMS for a government training center, and a travel agency site. Day to day I work with Laravel and React/Next.js.",
    cv: "Download CV (PDF)", email: "Email", fact_free: "Freelancing since 2023",
    projects: "Projects", k_role: "Role", k_when: "When", solo: "Solo project", 
    p1: "A travel agency website with an admin panel for trips, bookings, and invoices.",
    p2: "A family blog with its own editor and an A4 two-column PDF maker for school assignments and competitions.",
    p3: "An affiliate link page: followers find products by the number mentioned in each video.",
    p4: "Interface and frontend for a cross-border personal shopping store that manages international order batches.",
    exp: "Experience", now: "present", skills: "Skills", k_other: "Mobile & more",
    contact: "Contact", contact_p: "Email is the fastest way to reach me.", copy: "Copy", li_q: "LinkedIn (link coming)",
    back: "← All projects", home_lbl: "Home",
    d_lede: "I built this website and its admin panel on my own: designed the database, wrote the code, and shipped it to the server.",
    about: "About", about_p: "I'm a software engineer in Bogor, Indonesia, with a 2026 degree in Information Systems. Since 2023 I've taken freelance projects: an ISP billing system, a cross-border personal shopping store, an LMS for BPKP, and the Agendain travel agency site. I work mostly in Laravel and React/Next.js, and I design the screens in Figma before I write the code.",
    d_do: "What I built",
    d1: "<strong>Bilingual CMS.</strong> 7 public pages in Indonesian and English, with open trip, private trip, destination, and blog modules managed by admins.",
    d2: "<strong>Booking without overbooking.</strong> Quota checks and row locking at checkout. Invoices and itinerary PDFs reach customers through token links.",
    d3: "<strong>Access control.</strong> RBAC with custom roles and an audit log. Closed 7 security audit findings, including role escalation and session revocation.",
    d4: "<strong>SEO and performance.</strong> Image sitemap, RSS, and JSON-LD. Removed layout shift and sped up first paint on phones.",
    d5: "<strong>Deployment.</strong> A VPS behind a reverse proxy and CDN, with a deploy script that never touches production data.",
    d_note: "On the real site this section comes from the admin panel: context, problem, approach, results, and a screenshot gallery.",
    prev: "← Elenmor (Andiamo)", next: "qiran.my.id →"
  };
  var ID = {};
  document.querySelectorAll("[data-i]").forEach(function (el) { if (!(el.dataset.i in ID)) ID[el.dataset.i] = el.innerHTML; });
  var root = document.documentElement;
  function q(id) { return document.getElementById(id); }
  var lang = "id";

  // Pill glide: penanda meluncur ke tombol yang dipilih
  function pill(el, value) {
    var btns = el.querySelectorAll("button");
    btns.forEach(function (b, i) {
      var on = b.dataset.v === value;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) el.style.setProperty("--at", i);
    });
  }
  function onPill(el, fn) {
    el.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) fn(b.dataset.v); });
  }

  function setLang(l) {
    lang = l;
    var d = l === "en" ? EN : ID;
    document.querySelectorAll("[data-i]").forEach(function (el) { if (d[el.dataset.i] != null) el.innerHTML = d[el.dataset.i]; });
    root.lang = l;
    pill(q("lang"), l);
    if (q("peek")) peekLabel(q("site").classList.contains("peek"));
  }
  onPill(q("lang"), setLang);
  // Pantulan cahaya di panel kaca mengikuti kursor
  document.querySelectorAll("main > section, .detail-head").forEach(function (el) {
    el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); el.style.setProperty("--mx", (e.clientX - r.left) + "px"); el.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  });
  // Mata: sembunyikan semua isi supaya animasi bisa dinikmati
  var peekBtn = q("peek");
  function peekLabel(on) {
    var en = lang === "en";
    var t = on ? (en ? "Show content" : "Tampilkan isi") : (en ? "Hide content to watch the animation" : "Sembunyikan isi untuk melihat animasi");
    peekBtn.setAttribute("aria-label", t); peekBtn.setAttribute("title", t);
  }
  function setPeek(on) { q("site").classList.toggle("peek", on); peekBtn.setAttribute("aria-pressed", on ? "true" : "false"); peekLabel(on); }
  peekBtn.addEventListener("click", function () { setPeek(!q("site").classList.contains("peek")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && q("site").classList.contains("peek")) { setPeek(false); peekBtn.focus(); } });


  // Jarak geser tangkapan layar di dalam bingkai
  function measure() {
    document.querySelectorAll(".vp").forEach(function (vp) {
      var img = vp.querySelector("img");
      if (img) img.style.setProperty("--pan", Math.min(0, vp.clientHeight - img.clientHeight) + "px");
    });
  }
  document.querySelectorAll(".vp img").forEach(function (img) { img.addEventListener("load", measure); });
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(q("stage")); else window.addEventListener("resize", measure);
  measure();

  // Titik Live berdenyut dua kali saat kartunya muncul
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll(".proj, .detail-head").forEach(function (el) { io.observe(el); });
  }

  function press(on, off) { q(on).setAttribute("aria-pressed", "true"); q(off).setAttribute("aria-pressed", "false"); }
  q("v-phone").addEventListener("click", function () { q("stage").classList.add("phone"); press("v-phone", "v-desk"); requestAnimationFrame(measure); });
  q("v-desk").addEventListener("click", function () { q("stage").classList.remove("phone"); press("v-desk", "v-phone"); requestAnimationFrame(measure); });

  // Pindah halaman dengan View Transitions: bingkai dan judul Agendain berpindah mulus
  var current = null;
  function apply() {
    var detail = location.hash === "#agendain";
    if (detail === current) return false;
    current = detail;
    q("home").hidden = detail; q("hero").hidden = detail; q("detail").hidden = !detail; q("progress").hidden = !detail;
    q("site").classList.toggle("is-home", !detail);
    window.dispatchEvent(new CustomEvent("mockroute", { detail: { detail: detail } }));
    if (detail) press("p-detail", "p-home"); else press("p-home", "p-detail");
    return true;
  }
  function route(animate) {
    var detail = location.hash === "#agendain";
    if (detail === current) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var update = function () {
      apply();
      measure();
      var target = detail ? q("stage") : document.querySelector('#home [style*="title-agendain"]');
      if (target) target.scrollIntoView({ block: detail ? "start" : "center" });
    };
    if (animate && document.startViewTransition && !reduce) document.startViewTransition(update); else update();
  }
  q("p-home").addEventListener("click", function () { location.hash = "beranda"; });
  q("p-detail").addEventListener("click", function () { location.hash = "agendain"; });
  window.addEventListener("hashchange", function () { route(true); });
  apply();

  q("copy").addEventListener("click", function () {
    var btn = q("copy"), done = lang === "en" ? "Copied" : "Tersalin";
    var reset = function () { setTimeout(function () { btn.textContent = lang === "en" ? "Copy" : "Salin"; }, 1600); };
    function select() { var r = document.createRange(); r.selectNodeContents(q("addr")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    try { navigator.clipboard.writeText(q("addr").textContent).then(function () { btn.textContent = done; reset(); }, select); } catch (e) { select(); }
  });
})();
