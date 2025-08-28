document.addEventListener('DOMContentLoaded', () => {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;

  document.body.classList.add(isDay ? 'theme-jour' : 'theme-nuit');
});
