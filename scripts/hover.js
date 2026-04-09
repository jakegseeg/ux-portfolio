(function () {
  var supportsPointerTracking =
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lerpFactor = 0.08;

  document.querySelectorAll(".proj-card").forEach(function (card) {
    var color = card.dataset.glow;
    var grid = card.closest(".layout-works__grid");
    var touchTimer;
    var rafId = null;
    var pointerInside = false;
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;

    function setGlowPosition(x, y) {
      card.style.setProperty("--x", x + "px");
      card.style.setProperty("--y", y + "px");
    }

    function step() {
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;
      setGlowPosition(currentX, currentY);

      if (!pointerInside) {
        rafId = null;
        return;
      }

      if (
        Math.abs(targetX - currentX) < 0.1 &&
        Math.abs(targetY - currentY) < 0.1
      ) {
        currentX = targetX;
        currentY = targetY;
        setGlowPosition(currentX, currentY);
      }

      rafId = window.requestAnimationFrame(step);
    }

    function startAnimation() {
      if (rafId !== null || !pointerInside) return;
      rafId = window.requestAnimationFrame(step);
    }

    card.addEventListener("mouseenter", function (event) {
      if (grid) {
        grid.classList.add("grid--focused");
      }
      card.classList.add("card--active");
      card.style.boxShadow = "0 8px 36px -4px " + color + "70";

      if (!supportsPointerTracking) return;

      var rect = card.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      currentX = targetX;
      currentY = targetY;
      pointerInside = true;
      setGlowPosition(currentX, currentY);
      startAnimation();
    });

    card.addEventListener("mousemove", function (event) {
      if (!supportsPointerTracking) return;

      var rect = card.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      pointerInside = true;
      startAnimation();
    });

    card.addEventListener("mouseleave", function () {
      if (grid) {
        grid.classList.remove("grid--focused");
      }
      card.classList.remove("card--active");
      card.style.boxShadow = "";
      pointerInside = false;
    });

    card.addEventListener(
      "touchstart",
      function () {
        if (grid) {
          grid.classList.add("grid--focused");
        }
        card.classList.add("card--active");
        card.style.boxShadow = "0 8px 36px -4px " + color + "70";
        clearTimeout(touchTimer);
        touchTimer = setTimeout(function () {
          if (grid) {
            grid.classList.remove("grid--focused");
          }
          card.classList.remove("card--active");
          card.style.boxShadow = "";
        }, 1200);
      },
      { passive: true }
    );
  });
})();
