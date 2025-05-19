document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');

  const switchBtn = document.getElementById('switch-button');
  if (switchBtn) {
    switchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = switchBtn.getAttribute('data-target');
      document.body.classList.remove('fade-in');
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = target;
      }, 400);
    });
  }
});
