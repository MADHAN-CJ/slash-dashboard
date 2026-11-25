(() => {
  const prompt = document.querySelector('[data-demo-prompt]');
  prompt.addEventListener('click', () => prompt.setAttribute('aria-pressed', String(prompt.getAttribute('aria-pressed') !== 'true')));
  const button = document.querySelector('[data-copy-brief]');
  const brief = document.querySelector('#ai-brief');
  const status = document.querySelector('[data-copy-status]');
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brief.value);
      status.textContent = 'AI brief copied.';
    } catch {
      brief.focus();
      brief.select();
      status.textContent = 'Brief selected. Copy it with your keyboard or browser menu.';
    }
  });
})();
