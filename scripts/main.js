(function () {
  "use strict";

  var THEME_KEY = "ux-portfolio-theme";
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

  initTheme();
  bindThemeToggle();
  bindNav();
  setYear();
})();
