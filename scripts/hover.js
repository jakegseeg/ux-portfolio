document.querySelectorAll('.proj-card').forEach(card => {
  const color = card.dataset.glow;
  const grid = card.closest('.layout-works__grid');
  let touchTimer;

  card.addEventListener('mouseenter', () => {
    if (grid) {
      grid.classList.add('grid--focused');
    }
    card.classList.add('card--active');
    card.style.boxShadow = `0 8px 36px -4px ${color}70`;
  });

  card.addEventListener('mouseleave', () => {
    if (grid) {
      grid.classList.remove('grid--focused');
    }
    card.classList.remove('card--active');
    card.style.boxShadow = '';
  });

  card.addEventListener('touchstart', () => {
    if (grid) {
      grid.classList.add('grid--focused');
    }
    card.classList.add('card--active');
    card.style.boxShadow = `0 8px 36px -4px ${color}70`;
    clearTimeout(touchTimer);
    touchTimer = setTimeout(() => {
      if (grid) {
        grid.classList.remove('grid--focused');
      }
      card.classList.remove('card--active');
      card.style.boxShadow = '';
    }, 1200);
  }, { passive: true });
});
