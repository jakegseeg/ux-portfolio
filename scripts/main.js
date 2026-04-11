(function () {
  "use strict";

  var THEME_KEY = "theme";
  var root = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    var next = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      var isDark = next === "dark";
      toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      return;
    }
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  function bindThemeToggle() {
    var toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      setStoredTheme(next);
      applyTheme(next);
    });
  }

  function setNavOpen(nav, toggle, open) {
    if (!nav || !toggle) return;
    nav.setAttribute("data-open", open ? "true" : "false");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function closeNavOnResize(nav, toggle) {
    if (!nav || !toggle) return;
    var mq = window.matchMedia("(min-width: 40rem)");
    function onChange() {
      if (mq.matches) {
        setNavOpen(nav, toggle, false);
      }
    }
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
    } else {
      mq.addListener(onChange);
    }
  }

  function bindNav() {
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("nav-toggle");
    if (!nav || !toggle) return;

    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") !== "true";
      setNavOpen(nav, toggle, open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(nav, toggle, false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setNavOpen(nav, toggle, false);
      }
    });

    closeNavOnResize(nav, toggle);
  }

  function setYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initCursorGlow() {
    var supportsPointerTracking =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsPointerTracking || prefersReducedMotion) return;

    var pill = document.createElement("div");
    var pillLabel = document.createElement("span");
    var rafId = null;
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var currentX = targetX;
    var currentY = targetY;
    var lerpFactor = 0.12;
    var isActive = false;
    var hoveringCard = false;
    var pillWidth = 168;
    var pillHeight = 56;

    pill.className = "cursor-pill";
    pill.setAttribute("aria-hidden", "true");
    pillLabel.className = "cursor-pill__label";
    pillLabel.textContent = "View Case Study";
    pill.appendChild(pillLabel);
    document.body.appendChild(pill);

    function syncPillSize() {
      pillWidth = pill.offsetWidth || 168;
      pillHeight = pill.offsetHeight || 56;
    }

    function setAccent(card) {
      var accent = card && card.dataset ? card.dataset.glow : "";
      pill.style.setProperty(
        "--cursor-accent",
        accent ? accent + "66" : "rgba(255, 0, 204, 0.3)"
      );
    }

    function render() {
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;
      pill.style.left = currentX - pillWidth / 2 + "px";
      pill.style.top = currentY - pillHeight / 2 + "px";

      if (!isActive) {
        rafId = null;
        return;
      }

      rafId = window.requestAnimationFrame(render);
    }

    document.addEventListener("pointermove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;

      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }

      isActive = true;
      var card = event.target.closest(".proj-card");
      hoveringCard = Boolean(card);
      document.body.classList.toggle("cursor-card-hover", hoveringCard);

      if (hoveringCard) {
        setAccent(card);
        syncPillSize();
      }

      if (rafId === null) {
        rafId = window.requestAnimationFrame(render);
      }
    });

    document.addEventListener("pointerleave", function () {
      isActive = false;
      hoveringCard = false;
      document.body.classList.remove("cursor-card-hover");
    });

    window.addEventListener("blur", function () {
      isActive = false;
      hoveringCard = false;
      document.body.classList.remove("cursor-card-hover");
    });

    window.addEventListener("resize", syncPillSize);
    syncPillSize();
  }

  function initCaseStudyNav() {
    var nav = document.querySelector(".aol-case-nav");
    if (!nav) return;

    var links = Array.from(nav.querySelectorAll("[data-case-nav-link]"));
    if (!links.length) return;

    var progressEl = nav.querySelector(".aol-case-nav__progress");
    var reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function getTargets() {
      return links
        .map(function (link) {
          var id = link.getAttribute("href");
          var target = id ? document.querySelector(id) : null;
          if (!target) return null;
          return {
            link: link,
            target: target
          };
        })
        .filter(Boolean);
    }

    function updateNav() {
      var targets = getTargets();
      if (!targets.length) return;

      var viewportHeight = window.innerHeight;
      var currentY = window.scrollY + viewportHeight * 0.38;
      var triggerPoints = targets.map(function (item) {
        return Math.max(0, item.target.offsetTop - viewportHeight * 0.38);
      });
      var start = triggerPoints[0];
      var end = triggerPoints[triggerPoints.length - 1];
      var range = Math.max(1, end - start);
      var progress = Math.max(0, Math.min(1, (window.scrollY - start) / range));
      var activeIndex = 0;

      triggerPoints.forEach(function (point, index) {
        if (currentY >= point) {
          activeIndex = index;
        }
      });

      targets.forEach(function (item, index) {
        var isComplete = index < activeIndex;
        var isActive = index === activeIndex;
        item.link.classList.toggle("is-complete", isComplete);
        item.link.classList.toggle("is-active", isActive);
        item.link.setAttribute("aria-current", isActive ? "true" : "false");
      });

      if (progressEl) {
        progressEl.style.height = progress * 100 + "%";
      }
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        links.forEach(function (item) {
          item.classList.remove("is-active");
        });
        link.classList.add("is-active");

        if (reducedMotion) {
          updateNav();
        } else {
          window.requestAnimationFrame(updateNav);
        }
      });
    });

    window.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    updateNav();
  }

  initTheme();
  bindThemeToggle();
  bindNav();
  setYear();
  initCursorGlow();
  initCaseStudyNav();
})();
