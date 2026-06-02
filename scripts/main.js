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

    function scrollNavToActive(link) {
      if (!link) return;
      if (nav.scrollWidth <= nav.clientWidth) return;
      nav.scrollTo({
        left: link.offsetLeft - 16,
        behavior: reducedMotion ? "instant" : "smooth"
      });
    }

    function updateNav() {
      var targets = getTargets();
      if (!targets.length) return;

      var viewportHeight = window.innerHeight;
      var currentY = window.scrollY + viewportHeight * 0.38;
      var triggerPoints = targets.map(function (item) {
        return Math.max(0, item.target.offsetTop - viewportHeight * 0.38);
      });
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

      var progress = targets.length > 1 ? activeIndex / (targets.length - 1) : 0;

      nav.style.setProperty("--nav-progress", String(progress));

      if (progressEl) {
        progressEl.style.height = progress * 100 + "%";
      }

      scrollNavToActive(targets[activeIndex].link);
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

  function initSummitPrototype() {
    var modal = document.querySelector("[data-prototype-modal]");
    var frame = document.querySelector(".summit-prototype__frame");
    var belt = document.querySelector(".summit-logo-belt");
    var beltItems = belt ? Array.from(belt.querySelectorAll(".summit-logo-belt__track img")) : [];
    var beltFrame = null;
    var beltActive = true;

    function updateBeltItemOpacity() {
      if (!belt || !beltItems.length) return;

      var beltRect = belt.getBoundingClientRect();
      var beltWidth = beltRect.width;
      if (beltWidth <= 0) return;

      var fadeZone = beltWidth * 0.46;
      var rightZeroOffset = Math.max(20, beltWidth * 0.08);
      var rightZeroPoint = beltRect.right - rightZeroOffset;

      function clamp01(value) {
        return Math.max(0, Math.min(1, value));
      }

      beltItems.forEach(function (item) {
        var itemRect = item.getBoundingClientRect();
        var leftOpacity = clamp01((itemRect.left - beltRect.left) / Math.max(1, fadeZone));
        var rightOpacity = clamp01((rightZeroPoint - itemRect.right) / Math.max(1, fadeZone));
        var opacity = Math.min(1, leftOpacity, rightOpacity);

        item.style.opacity = String(opacity);
      });
    }

    function runBeltFade() {
      if (!beltActive) {
        beltFrame = null;
        return;
      }
      updateBeltItemOpacity();
      beltFrame = window.requestAnimationFrame(runBeltFade);
    }

    function startBeltFadeLoop() {
      if (!belt || !beltItems.length || beltFrame !== null) return;
      beltActive = true;
      beltFrame = window.requestAnimationFrame(runBeltFade);
    }

    function stopBeltFadeLoop() {
      beltActive = false;
      if (beltFrame !== null) {
        window.cancelAnimationFrame(beltFrame);
        beltFrame = null;
      }
    }

    if (belt && beltItems.length) {
      updateBeltItemOpacity();
      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                startBeltFadeLoop();
              } else {
                stopBeltFadeLoop();
              }
            });
          },
          { threshold: 0.05 }
        );
        observer.observe(belt);
      } else {
        startBeltFadeLoop();
      }

      window.addEventListener("resize", updateBeltItemOpacity);
    }

    function scalePrototypeFrame() {
      if (!frame) return;
      var scale = frame.offsetWidth / 1440;
      frame.style.height = 900 * scale + "px";
      frame.style.setProperty("--iframe-scale", String(scale));
    }

    scalePrototypeFrame();
    window.addEventListener("resize", scalePrototypeFrame);

    if (!modal) return;

    var openers = Array.from(document.querySelectorAll("[data-prototype-open]"));
    var closers = Array.from(document.querySelectorAll("[data-prototype-close]"));
    var dialog = modal.querySelector(".summit-prototype-modal__dialog");

    function scaleModalFrame() {
      if (!dialog) return;
      var iframe = dialog.querySelector("iframe");
      if (!iframe) return;
      var availableWidth = dialog.clientWidth - 40;
      var availableHeight = dialog.clientHeight - 76;
      var scale = Math.min(availableWidth / 1440, availableHeight / 900);
      dialog.style.setProperty("--modal-iframe-scale", String(scale));
      iframe.style.marginBottom = 900 * scale - 900 + "px";
    }

    window.addEventListener("resize", scaleModalFrame);

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      scaleModalFrame();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    openers.forEach(function (opener) {
      opener.addEventListener("click", openModal);
    });

    closers.forEach(function (closer) {
      closer.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });
  }

  function initClubAbilityCompare() {
    var root = document.querySelector("[data-before-after]");
    if (!root) return;

    var viewport = root.querySelector(".clubability-compare__viewport");
    var clip = root.querySelector(".clubability-compare__clip");
    var beforeFrame = root.querySelector(".clubability-compare__iframe--before");
    var range = root.querySelector(".clubability-compare__range");
    if (!viewport || !clip || !beforeFrame || !range) return;

    function syncBeforeWidth() {
      var w = viewport.offsetWidth;
      if (w) {
        beforeFrame.style.width = w + "px";
      }
    }

    function updateClip() {
      clip.style.width = Number(range.value) + "%";
    }

    syncBeforeWidth();
    updateClip();
    range.addEventListener("input", updateClip);
    window.addEventListener("resize", syncBeforeWidth);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(syncBeforeWidth);
      ro.observe(viewport);
    }
  }

  function initClubAbilityTabs() {
    var root = document.querySelector("[data-iteration-tabs]");
    if (!root) return;

    var tabs = Array.from(root.querySelectorAll(".clubability-tabs__tab"));
    var panels = Array.from(root.querySelectorAll("[data-tab-panel]"));
    if (!tabs.length || !panels.length) return;

    function activate(id) {
      tabs.forEach(function (tab) {
        var isSel = tab.getAttribute("data-tab-id") === id;
        tab.setAttribute("aria-selected", isSel ? "true" : "false");
        tab.classList.toggle("is-active", isSel);
        tab.setAttribute("tabindex", isSel ? "0" : "-1");
      });
      panels.forEach(function (panel) {
        var match = panel.getAttribute("data-tab-panel") === id;
        panel.hidden = !match;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-tab-id"));
      });
    });
  }

  function initClubAbility() {
    if (!document.body || !document.body.hasAttribute("data-club-page")) return;
    initClubAbilityCompare();
    initClubAbilityTabs();
  }

  initTheme();
  bindThemeToggle();
  bindNav();
  setYear();
  initCursorGlow();
  initCaseStudyNav();
  initSummitPrototype();
  initClubAbility();
})();
