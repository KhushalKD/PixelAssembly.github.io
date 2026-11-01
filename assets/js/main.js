/* ==========================================================================
   Pixel Assembly — site behaviour
   No dependencies. Everything degrades to a working static page.
   ========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- header */
  function header() {
    var hdr = $(".hdr");
    var nav = $("#nav");
    var burger = $("#burger");
    if (!hdr) return;

    var onScroll = function () { hdr.classList.toggle("is-stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!nav || !burger) return;

    var close = function () {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
    };

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    $$("a", nav).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 880) close(); });
  }

  /* ---------------------------------------------------------------- reveal */
  function reveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------- counters */
  function counters() {
    var nodes = $$("[data-count]");
    if (!nodes.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = (el.getAttribute("data-dec") | 0);
      var dur = 1250;
      var t0 = null;
      var tick = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        var d = el.getAttribute("data-dec") | 0;
        el.textContent = parseFloat(el.getAttribute("data-count")).toFixed(d);
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------- 3D hero assembly
     A pixel relief that re-forms into the things a client actually ends up
     with — their website, their brand, their feed, an edit, a campaign and
     the build underneath. Nothing in the drawing is labelled: a play
     triangle over a timeline reads as video, a 3x3 grid reads as a feed.
     The figure caption names each one; the artwork never does.

     The board faces the viewer rather than lying down like a floor. Turn a
     grid flat and the pixels foreshorten into mush and tall cells hide the
     rows behind them; stand it up, extrude each pixel toward the camera
     instead, and both problems go. Every extrusion is parallel, so a cell
     can only ever clip a sliver of its neighbour — which is the part that
     reads as depth.

     Canvas rather than CSS 3D, because a morph moves all 168 cells on
     every frame. In CSS that is 168 style writes per frame plus the
     browser guessing at depth order between them; here it is three filled
     paths per cell and a painter's sort we control. Same flat fills as the
     rest of the site, still no library.

     Legend:  .  recessed   -  inset panel   o  surface   #  ink
              F  flame      c  cobalt
     Every row of every map must be exactly COLS long. */
  var ASM_TONE = {
    /* [ front, top, left side ] — three flat tones, never a gradient. */
    ".": ["#E4DFD5", "#EFEBE2", "#CEC6B5"],
    "-": ["#CCC3B1", "#D9D1C1", "#AFA692"],
    "o": ["#EFEAE0", "#FAF7F0", "#D5CDBC"],
    "#": ["#1E1B16", "#2F2B23", "#100E0A"],
    "F": ["#D9380F", "#F1562B", "#A32708"],
    "c": ["#1C3C8C", "#2A50AE", "#132A64"]
  };
  /* How far each kind of cell stands out of the board, in cell widths.
     Flame stands proudest, so the accent catches the eye first. */
  var ASM_H = { ".": 0.08, "-": 0.24, "o": 0.48, "#": 0.80, "c": 0.80, "F": 1.05 };

  var ASM_SHAPES = [
    { cap: "the website", map: [
      "##############",
      "oooooooooooooo",
      "oFooooooo###oo",
      "oooooooooooooo",
      "o#####oo-----o",
      "o###oooo-----o",
      "oooooooo-----o",
      "oooooooo-----o",
      "oFFFoooo###ooo",
      "oFFFoooo##oooo",
      "oooooooooooooo",
      "oooooooooooooo"] },

    { cap: "the brand", map: [
      "oooooooooooooo",
      "oo######ooFFoo",
      "oo##oo##ooFFoo",
      "oo##oo##oooooo",
      "oo######ooccoo",
      "oo##oo##ooccoo",
      "oo##oo##oooooo",
      "oooooooooooooo",
      "oo######oo##oo",
      "oo####oooo##oo",
      "oooooooooooooo",
      "oooooooooooooo"] },

    { cap: "the feed", map: [
      "oooooooooooooo",
      "oo##oo######oo",
      "oo##oo####oooo",
      "oooooooooooooo",
      "oo--oo--oo--oo",
      "oo--oo--oo--oo",
      "oooooooooooooo",
      "oo--ooFFoo--oo",
      "oo--ooFFoo--oo",
      "oooooooooooooo",
      "oo--oo--oo--oo",
      "oo--oo--oo--oo"] },

    { cap: "the edit", map: [
      "oooooooooooooo",
      "o------------o",
      "o------------o",
      "o----FF------o",
      "o----FFFF----o",
      "o----FFFFFF--o",
      "o----FFFF----o",
      "o----FF------o",
      "o------------o",
      "oooooooooooooo",
      "oFFFFo##o##ooo",
      "oooooooooooooo"] },

    { cap: "the campaign", map: [
      "oooooooooooooo",
      "ooooooooooFFoo",
      "ooooooooooFFoo",
      "ooooooo##oFFoo",
      "ooooooo##oFFoo",
      "oooo##o##oFFoo",
      "oooo##o##oFFoo",
      "o##o##o##oFFoo",
      "o##o##o##oFFoo",
      "o##o##o##oFFoo",
      "o##o##o##oFFoo",
      "oooooooooooooo"] },

    { cap: "the build", map: [
      "oooooooooooooo",
      "o#oo######oooo",
      "oooooooooooooo",
      "o#ooo###o####o",
      "oooooooooooooo",
      "o#oooFFF###ooo",
      "oooooooooooooo",
      "o#ooooo####ooo",
      "oooooooooooooo",
      "o#ooo###oFFooo",
      "oooooooooooooo",
      "o#oo####oooooo"] }
  ];

  function assembly() {
    var cv = $("#assembly");
    var cap = $("#assembly-cap");
    if (!cv || !cv.getContext) return;

    var ctx = cv.getContext("2d");
    var COLS = ASM_SHAPES[0].map[0].length;
    var ROWS = ASM_SHAPES[0].map.length;
    var SUNK = ASM_H["."];
    var GAP = 0.12;             // between cells, so they read as pixels
    var YAW = 19 * Math.PI / 180;    // board turned, so the sides show
    var TIP = -14 * Math.PI / 180;   // and tipped, so the tops do
    var MORPH = 980;            // one figure becoming the next
    var SWEEP = 420;            // of which this much is the diagonal lag
    var REST = 1900;            // how long a finished figure sits still

    var cells = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        cells.push({
          c: c, r: r,
          role: ".", role1: ".",
          h: 0, h0: 0, h1: SUNK,
          /* A diagonal lag, so a change crosses the board as a wave
             instead of every cell twitching at once. */
          lag: ((c / (COLS - 1)) + (r / (ROWS - 1))) / 2 * SWEEP,
          moving: false
        });
      }
    }

    var order = cells.slice();
    var shape = 0, morphAt = 0, restUntil = 0, started = false;
    var yaw = YAW, yawTo = YAW, tip = TIP, tipTo = TIP;
    var sy = 0, cy = 1, sp = 0, cp = 1, u = 1, ox = 0, oy = 0;
    var live = false, raf = null, dirty = true, opened = false, capNext = null;

    function setShape(i, all) {
      var map = ASM_SHAPES[i].map;
      for (var k = 0, r = 0; r < ROWS; r++) {
        var row = map[r];
        for (var c = 0; c < COLS; c++, k++) {
          var cell = cells[k];
          var next = row.charAt(c);
          cell.role1 = next;
          cell.h1 = ASM_H[next];
          cell.h0 = cell.h;
          /* Only cells that actually change move. Whatever two figures
             share stays put, so the change reads as a rebuild rather than
             a cut to a different picture. */
          cell.moving = all || next !== cell.role;
          if (!cell.moving) { cell.role = next; cell.h = cell.h1; }
        }
      }
      /* The caption waits for the halfway point of the morph. Switching it
         up front would name the incoming figure while the board still shows
         the outgoing one. */
      var text = "Fig. 0" + (i + 1) + " — " + ASM_SHAPES[i].cap;
      if (all) { if (cap) cap.textContent = text; capNext = null; } else { capNext = text; }
    }

    function settle() {
      for (var k = 0; k < cells.length; k++) {
        var cell = cells[k];
        cell.moving = false;
        cell.role = cell.role1;
        cell.h = cell.h1;
      }
    }

    function eo(t) { return 1 - Math.pow(1 - t, 3); }

    function advance(now) {
      var busy = false;
      var span = MORPH - SWEEP;
      for (var k = 0; k < cells.length; k++) {
        var cell = cells[k];
        if (!cell.moving) continue;
        var t = (now - morphAt - cell.lag) / span;
        if (t <= 0) { busy = true; continue; }
        if (t >= 1) { cell.moving = false; cell.role = cell.role1; cell.h = cell.h1; continue; }
        busy = true;
        /* Each change sinks into the board and rises back out, and the
           colour switches at the bottom. Cross-fading one flat fill into
           another would only make mud. */
        if (t < 0.5) {
          cell.h = cell.h0 + (SUNK - cell.h0) * eo(t * 2);
        } else {
          cell.role = cell.role1;
          cell.h = SUNK + (cell.h1 - SUNK) * eo(t * 2 - 1);
        }
      }
      return busy;
    }

    /* Board in the screen plane, pixels extruded toward the camera: turn
       about the vertical axis, then tip about the horizontal one. */
    function px(gx, gy, gz) { return ox + (gx * cy + gz * sy) * u; }
    function py(gx, gy, gz) { return oy + (gy * cp - (gz * cy - gx * sy) * sp) * u; }

    function quad(fill, ax, ay, az, bx, by, bz, c1, c2, c3, dx, dy, dz) {
      ctx.beginPath();
      ctx.moveTo(px(ax, ay, az), py(ax, ay, az));
      ctx.lineTo(px(bx, by, bz), py(bx, by, bz));
      ctx.lineTo(px(c1, c2, c3), py(c1, c2, c3));
      ctx.lineTo(px(dx, dy, dz), py(dx, dy, dz));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function draw() {
      var w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      sy = Math.sin(yaw); cy = Math.cos(yaw);
      sp = Math.sin(tip); cp = Math.cos(tip);
      /* 14.8 x 13.0 is the board's own footprint in cell widths at the
         extremes of the pointer swing, plus a margin. */
      u = Math.min(w / 14.8, h / 13.0);
      /* Sat a little above centre: the caption hangs below the canvas, so
         dead centre reads as low. */
      ox = w / 2; oy = h * 0.47;

      /* Painter's algorithm, furthest first. Turned right we see each
         pixel's left flank; tipped back we see its top. */
      order.sort(function (a, b) { return depth(a) - depth(b); });

      for (var k = 0; k < order.length; k++) {
        var cell = order[k];
        var t = ASM_TONE[cell.role];
        var x0 = cell.c - COLS / 2 + GAP / 2, x1 = x0 + 1 - GAP;
        var y0 = cell.r - ROWS / 2 + GAP / 2, y1 = y0 + 1 - GAP;
        var z = cell.h;

        quad(t[2], x0, y0, z, x0, y1, z, x0, y1, 0, x0, y0, 0);
        quad(t[1], x0, y0, z, x1, y0, z, x1, y0, 0, x0, y0, 0);
        quad(t[0], x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z);
      }
    }

    function depth(cell) {
      var x = cell.c - COLS / 2 + 0.5, y = cell.r - ROWS / 2 + 0.5;
      return y * sp + (cell.h * cy - x * sy) * cp;
    }

    function frame(now) {
      raf = null;
      if (!live) return;

      if (!started) {
        started = true;
        morphAt = now;
        restUntil = now + MORPH + REST;
      }

      var dy = yawTo - yaw, dt = tipTo - tip;
      if (Math.abs(dy) > 0.0004 || Math.abs(dt) > 0.0004) {
        yaw += dy * 0.08;
        tip += dt * 0.08;
        dirty = true;
      }

      if (advance(now)) {
        dirty = true;
      } else if (now > restUntil) {
        shape = (shape + 1) % ASM_SHAPES.length;
        morphAt = now;
        restUntil = now + MORPH + REST;
        setShape(shape, false);
        dirty = true;
      }

      if (capNext && now - morphAt > MORPH * 0.52) {
        if (cap) cap.textContent = capNext;
        capNext = null;
      }

      if (dirty) { draw(); dirty = false; }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", function () { dirty = true; if (reduced) draw(); });

    if (reduced) {
      /* One figure, no cycle, no pointer, no loop. The second paint is
         insurance: nothing here retries, so if the canvas had no size on
         the first one it would stay blank for good. */
      setShape(0, true);
      settle();
      draw();
      requestAnimationFrame(draw);
      return;
    }

    setShape(0, true);

    /* Nothing runs while the hero is off screen — a canvas loop painting
       away behind the fold is pure battery. Resuming settles the figure
       first, because `now` will have jumped while we were gone. */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var on = entries[0].isIntersecting;
        if (on === live) return;
        live = on;
        if (on) {
          /* Settle only on a RE-entry; the first time through, the
             figure still has to rise out of the board. */
          if (opened) settle();
          opened = true;
          started = false;
          dirty = true;
          raf = requestAnimationFrame(frame);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }, { threshold: 0 }).observe(cv);
    } else {
      live = true;
      raf = requestAnimationFrame(frame);
    }

    if (!window.matchMedia("(hover: none)").matches) {
      var host = cv.closest(".hero") || document.body;
      host.addEventListener("mousemove", function (e) {
        var b = host.getBoundingClientRect();
        yawTo = YAW + ((e.clientX - b.left) / b.width - 0.5) * 0.42;
        tipTo = TIP - ((e.clientY - b.top) / b.height - 0.5) * 0.24;
      });
      host.addEventListener("mouseleave", function () { yawTo = YAW; tipTo = TIP; });
    }
  }

  /* ----------------------------------------------------------- tilt cards */
  function tilt() {
    if (reduced || window.matchMedia("(hover: none)").matches) return;

    $$(".tilt").forEach(function (wrap) {
      var inner = $(".tilt__in", wrap);
      if (!inner) return;
      var max = parseFloat(wrap.getAttribute("data-tilt") || "9");
      // Lifting the card toward the viewer is what sells the tilt; rotation on
      // its own just looks like a skew.
      var lift = parseFloat(wrap.getAttribute("data-lift") || "16");
      var raf = null, rx = 0, ry = 0;

      wrap.addEventListener("mousemove", function (e) {
        var b = wrap.getBoundingClientRect();
        ry = ((e.clientX - b.left) / b.width - 0.5) * (max * 2);
        rx = -((e.clientY - b.top) / b.height - 0.5) * (max * 2);
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          inner.style.transform =
            "translateZ(" + lift + "px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        });
      });

      wrap.addEventListener("mouseleave", function () {
        inner.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------------- filters */
  function filters() {
    var bar = $("#workFilters");
    if (!bar) return;
    var items = $$("[data-cat]");
    var count = $("#workCount");

    $$("button", bar).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        $$("button", bar).forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        var shown = 0;
        items.forEach(function (it) {
          var ok = f === "all" || it.getAttribute("data-cat").indexOf(f) > -1;
          it.classList.toggle("is-hidden", !ok);
          if (ok) shown++;
        });
        if (count) count.textContent = shown < 10 ? "0" + shown : String(shown);
      });
    });
  }

  /* ------------------------------------------------------------ accordion */
  function accordion() {
    $$(".acc").forEach(function (acc) {
      var btns = $$(".acc__btn", acc);
      btns.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (!panel) return;
        btn.addEventListener("click", function () {
          var open = btn.getAttribute("aria-expanded") === "true";
          btns.forEach(function (other) {
            var p = document.getElementById(other.getAttribute("aria-controls"));
            if (!p) return;
            other.setAttribute("aria-expanded", "false");
            p.style.height = "0px";
          });
          if (!open) {
            btn.setAttribute("aria-expanded", "true");
            panel.style.height = panel.firstElementChild.offsetHeight + "px";
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------------- form
     Set ENDPOINT to a form service URL (Formspree, Getform, Netlify, your
     own API) and the form posts there. Left empty, it falls back to opening
     the visitor's mail client with everything pre-filled.                 */
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbxXkpaTH7Q45MTPfiOmOXzamXxuxcoBc0_pSEYifQ6tfapf9207v0iALcyKi_kc6_yuGw/exec";
  var MAILTO = "info.pixelassembly@gmail.com";
  var HONEYPOT = "website";

  function form() {
    var f = $("#enquiry");
    if (!f) return;
    var status = $("#formStatus");
    var submit = $("#formSubmit");

    var setErr = function (field, msg) {
      field.classList.toggle("is-bad", !!msg);
      var slot = $(".field__err", field);
      if (slot) slot.textContent = msg || "";
      var input = $("input, select, textarea", field);
      if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    };

    var validate = function () {
      var ok = true;
      $$(".field", f).forEach(function (field) {
        var input = $("input[required], select[required], textarea[required]", field);
        if (!input) return;
        var v = (input.value || "").trim();
        if (!v) { setErr(field, "Required"); ok = false; return; }
        if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
          setErr(field, "Check this address"); ok = false; return;
        }
        setErr(field, "");
      });
      return ok;
    };

    $$("input, select, textarea", f).forEach(function (el) {
      el.addEventListener("input", function () {
        var field = el.closest(".field");
        if (field && field.classList.contains("is-bad")) setErr(field, "");
      });
    });

    var say = function (msg) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = false;
    };

    var setBusy = function (busy) {
      if (!submit) return;
      submit.disabled = busy;
      submit.setAttribute("aria-busy", busy ? "true" : "false");
    };

    f.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: nobody sees this field, so anything in it came from a bot.
      // Report success so it logs a win and does not retry.
      var trap = f.elements[HONEYPOT];
      if (trap && trap.value.trim()) {
        f.reset();
        say("Thanks — we have it.");
        return;
      }

      if (!validate()) {
        say("Some details are missing — check the highlighted fields.");
        var bad = $(".field.is-bad input, .field.is-bad select, .field.is-bad textarea", f);
        if (bad) bad.focus();
        return;
      }

      var data = new FormData(f);
      var services = data.getAll("services").join(", ") || "Not specified";

      if (ENDPOINT) {
        setBusy(true);
        say("Sending…");

        // URLSearchParams sends application/x-www-form-urlencoded, which keeps
        // this a "simple" CORS request. Apps Script cannot answer a preflight,
        // and it cannot read multipart/form-data either — so never post the
        // FormData object directly here.
        fetch(ENDPOINT, { method: "POST", body: new URLSearchParams(data) })
          .then(function (r) { return r.text(); })
          .then(function (text) {
            var res;
            try { res = JSON.parse(text); }
            catch (err) { res = { ok: /success/i.test(text) }; }

            if (res.ok) {
              f.reset();
              say("Thanks — we have it. You will hear back within 48 hours.");
            } else {
              say(res.error || "That did not go through. Email " + MAILTO + " and we will pick it up.");
            }
          })
          .catch(function () {
            say("That did not go through. Email " + MAILTO + " and we will pick it up.");
          })
          .then(function () { setBusy(false); });
        return;
      }

      var body = [
        "Name: " + data.get("name"),
        "Email: " + data.get("email"),
        "Company: " + (data.get("company") || "—"),
        "Budget: " + (data.get("budget") || "—"),
        "Services: " + services,
        "",
        data.get("message")
      ].join("\n");

      window.location.href =
        "mailto:" + MAILTO +
        "?subject=" + encodeURIComponent("New enquiry — " + (data.get("company") || data.get("name"))) +
        "&body=" + encodeURIComponent(body);

      say("Your mail app should be opening with the enquiry ready to send. If nothing happens, write to " + MAILTO + ".");
    });
  }

  /* ----------------------------------------------------------------- misc */
  function misc() {
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

    // duplicate the ticker set so the loop has no seam
    var track = $(".ticker__track");
    if (track && track.children.length === 1) {
      track.appendChild(track.firstElementChild.cloneNode(true));
    }
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    header();
    reveal();
    counters();
    assembly();
    tilt();
    filters();
    accordion();
    form();
    misc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
