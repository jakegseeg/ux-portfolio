document.querySelectorAll('.proj-card').forEach(card => {
  const color = card.dataset.glow;
  let touchTimer;

  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = `0 8px 36px -4px ${color}70`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '';
  });

  card.addEventListener('touchstart', () => {
    card.classList.add('is-active');
    card.style.boxShadow = `0 8px 36px -4px ${color}70`;
    clearTimeout(touchTimer);
    touchTimer = setTimeout(() => {
      card.classList.remove('is-active');
      card.style.boxShadow = '';
    }, 1200);
  }, { passive: true });
});
