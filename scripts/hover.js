(function () {
  "use strict";

  /**
   * Pointer-driven glow: updates --glow-x / --glow-y on project grid cells
   * so layout.css radial-gradient tracks the cursor. Uses percent strings
   * compatible with CSS custom properties.
   */
  function clampPct(n) {
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function initHoverGlow() {
    var cells = document.querySelectorAll("[data-hover-glow]");
    if (!cells.length) return;

    cells.forEach(function (cell) {
      cell.style.setProperty("--glow-x", "50%");
      cell.style.setProperty("--glow-y", "50%");

      cell.addEventListener("mousemove", function (e) {
        var rect = cell.getBoundingClientRect();
        var x = clampPct(((e.clientX - rect.left) / rect.width) * 100);
        var y = clampPct(((e.clientY - rect.top) / rect.height) * 100);
        cell.style.setProperty("--glow-x", x + "%");
        cell.style.setProperty("--glow-y", y + "%");
      });

      cell.addEventListener("mouseleave", function () {
        cell.style.setProperty("--glow-x", "50%");
        cell.style.setProperty("--glow-y", "50%");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHoverGlow);
  } else {
    initHoverGlow();
  }
})();
