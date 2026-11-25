(() => {
  const copy = document.querySelector('.real-data-copy');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!copy || motion.matches || !('IntersectionObserver' in window)) return;

  const colors = ['#67b7da', '#7caf80', '#d6b333', '#d28ebc'];
  const letters = [];
  let wordIndex = 0;
  const accessibleCopy = document.createElement('span');
  accessibleCopy.classList.add('reveal-accessible');
  accessibleCopy.textContent = copy.textContent;
  function prepare(element) {
    for (const node of [...element.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        for (const part of node.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
          else {
            const word = document.createElement('span');
            word.textContent = part;
            styleWord(word);
            fragment.append(word);
          }
        }
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('markets-label')) styleWord(node);
        else prepare(node);
      }
    }
  }
  function styleWord(word) {
    word.classList.add('reveal-word');
    word.setAttribute('aria-hidden', 'true');
    word.style.setProperty('--word-delay', `${letters.length * 12}ms`);
    word.style.setProperty('--reveal-color', colors[wordIndex % colors.length]);
    wordIndex++;
    splitLetters(word);
  }
  function character() {
    const letter = document.createElement('span');
    letter.classList.add('reveal-char');
    letter.style.setProperty('--reveal-delay', `${letters.length * 12}ms`);
    letters.push(letter);
    return letter;
  }
  function splitLetters(element) {
    for (const node of [...element.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        for (const value of node.textContent) {
          if (/\s/.test(value)) fragment.append(document.createTextNode(value));
          else {
            const letter = character();
            letter.textContent = value;
            fragment.append(letter);
          }
        }
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('markets-slash')) {
          const letter = character();
          node.replaceWith(letter);
          letter.append(node);
        } else splitLetters(node);
      }
    }
  }

  prepare(copy);
  copy.append(accessibleCopy);
  copy.dataset.reveal = 'ready';
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .25)) return;
    copy.dataset.reveal = 'playing';
    window.scrollMotion?.trackTree(copy);
    observer.disconnect();
  }, { threshold: .25, rootMargin: '0px 0px -8% 0px' });
  observer.observe(copy);
  copy.addEventListener('animationend', event => {
    if (event.animationName === 'letter-pixel-reveal' && event.target === letters.at(-1)) {
      copy.dataset.reveal = 'complete';
    }
  });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    copy.dataset.reveal = 'complete';
  });
})();
