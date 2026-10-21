(() => {
  const $ = (selector) => document.querySelector(selector);
  const heroVisual = $('.hero-visual');
  const home = $('.hero-visual-home');
  const dock = $('.chat-dock');
  const stage = $('.examples-stage');
  const diagram = $('.examples-diagram');
  const workWindow = $('.work-window');
  const steps = [...document.querySelectorAll('.markets-activity li')];
  const platformChoices = [...document.querySelectorAll('[data-platform-choice]')];
  const exampleChoices = [...document.querySelectorAll('[data-example]')];
  const question = $('.user-message .typed-text');
  const answer = $('.assistant-answer .typed-text');
  const draft = $('.composer-draft');
  const questionBubble = $('.user-message');
  const composerEntry = $('.composer-entry');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollMotion = window.scrollMotion;
  const setStepTimeout = scrollMotion?.setTimeout || setTimeout;
  const clearStepTimeout = scrollMotion?.clearTimeout || clearTimeout;
  const toolStepDuration = 3500;
  const narrowScreen = matchMedia('(max-width: 820px)');
  const scrollSupported = CSS.supports('animation-timeline: scroll(root block)') && CSS.supports('animation-range: 0px 100px');
  let exampleKey = 'screen';
  let sceneActive = false;
  let conversationStarted = false;
  let renderConversation;
  let conversationElapsed = 0;
  let selectedStep = -1;
  let inspectedStep = null;
  let hoverTimer;
  let inlineScrollFrame;
  let animationFrame;
  let bubbleAnimation;
  let panelAnimation;
  let panelContentAnimations = [];
  let terminalFrame;
  let closeTimer;
  let geometryFrame;
  let dockObserver;
  let returnObserver;
  let homeObserver;
  let homeSnapArmed = false;
  let snapAnimation;
  let snapFrame;
  let measuredPreviewWidth;

  // Static illustrative data, never presented as a live market feed.
  const examples = {
    screen: {
      question: 'Which Nifty 50 stocks look oversold?',
      answer: 'TCS, Infosys and HCLTech match, each with a 14-day RSI below 30.',
      steps: [
        ['Load Nifty 50 prices', 'chart', 'prices'],
        ['Check 14-day RSI', 'rsi', 'rsi'],
        ['Find stocks below RSI 30', 'filter', 'matches']
      ]
    },
    levels: {
      question: 'Mark support and resistance on Nifty.',
      answer: 'Support is near 24,800 and resistance near 25,100. Both are marked on your chart.',
      steps: [
        ['Read Nifty price action', 'chart', 'price-chart'],
        ['Find and draw the key levels', 'draw', 'draw']
      ]
    },
    watch: {
      question: 'Watch Nifty. Alert me above 25,100.',
      answer: "I'll watch Nifty and alert you above 25,100, even after you close this chat.",
      steps: [
        ["Check Nifty's price", 'chart', 'instrument'],
        ['Watch for a break above 25,100', 'watch', 'watch']
      ]
    }
  };

  const workTitles = {
    prices: 'Read daily prices', rsi: 'Check RSI(14)', matches: 'Your oversold stocks',
    'price-chart': 'Read Nifty prices', draw: 'Mark the key levels',
    instrument: 'Check Nifty', watch: 'Start your price watch'
  };

  function marketCandles(variant = 0) {
    const bars = [[29,43,22,38],[38,45,28,32],[32,51,29,46],[46,56,37,40],[40,62,35,56],[56,65,45,50],[50,72,46,66],[66,76,54,61],[61,81,58,75],[75,86,65,79]];
    const candles = bars.map(([open, high, low, close], index) => {
      const offset = variant * (index % 3 - 1) * 3;
      open += offset;
      close -= offset;
      high = Math.max(high, open, close) + 2;
      low = Math.min(low, open, close) - 2;
      const x = index * 23 + 16;
      return '<g class="market-candle ' + (close >= open ? 'candle-up' : 'candle-down') + '" style="--candle:' + index + '"><line x1="' + x + '" x2="' + x + '" y1="' + (100 - high) + '" y2="' + (100 - low) + '"/><rect x="' + (x - 5) + '" y="' + (100 - Math.max(open, close)) + '" width="10" height="' + Math.max(2, Math.abs(close - open)) + '"/></g>';
    }).join('');
    return '<svg class="market-candles" viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden="true">' + candles + '</svg>';
  }

  function backendVisual(view) {
    if (view === 'prices') {
      return '<div class="price-feeds" role="img" aria-label="Daily candlestick price histories for TCS, Infosys and HCLTech">' + ['TCS', 'Infosys', 'HCLTech'].map((stock, index) => '<div class="price-feed" style="--tile:' + index + '"><span>' + stock + '</span>' + marketCandles(index) + '<span class="feed-check">✓</span></div>').join('') + '</div>';
    }
    if (view === 'matches') {
      return '<div class="visual-meta"><span>3 matches</span><span>RSI &lt; 30</span></div><div class="match-list">' + [['TCS',27.6],['Infosys',28.4],['HCLTech',29.1]].map(([name, rsi], index) => '<div class="match-row" style="--tile:' + index + '"><span class="feed-check">✓</span><strong>' + name + '</strong><span>' + rsi + '</span></div>').join('') + '</div>';
    }
    if (view === 'rsi') {
      return '<div class="visual-meta"><span>14-day RSI</span><span>Below 30</span></div><div class="signal-list">' + [['TCS',27.6],['Infosys',28.4],['HCLTech',29.1]].map(([name, rsi], index) => '<div class="signal-row" style="--tile:' + index + ';--signal:' + rsi + '%"><span>' + name + '</span><span class="signal-track"><i></i></span><span class="signal-value">' + rsi + '</span></div>').join('') + '</div>';
    }
    if (['instrument', 'price-chart', 'draw'].includes(view)) {
      const levels = view === 'draw';
      return '<div class="visual-meta"><span>NIFTY 50</span><span>Daily</span></div><div class="backend-chart" role="img" aria-label="Nifty daily candlestick chart' + (levels ? ', with support at 24,800 and resistance at 25,100' : '') + '">' + marketCandles() + (levels ? '<div class="chart-level chart-resistance"><span>25,100</span></div><div class="chart-level chart-support"><span>24,800</span></div>' : '') + '</div>';
    }
    if (view === 'watch') {
      return '<div class="watch-visual"><span class="watch-ring" aria-hidden="true"></span><div><span>Nifty above</span><strong>25,100</strong></div><span class="activity-icon activity-watch" aria-hidden="true"></span></div><div class="watch-connection"><span>NIFTY 50</span><span>Watch running</span></div>';
    }
  }

  function animateBackend(instant, elapsed = 0) {
    cancelAnimationFrame(terminalFrame);
    workWindow.dataset.streaming = String(!instant);
    if (instant) return;
    const duration = narrowScreen.matches ? toolStepDuration : 1800;
    if (elapsed >= duration) { workWindow.dataset.streaming = 'false'; $('.work-state').textContent = 'Done'; return; }
    let startedAt;
    function tick(now) {
      now = scrollMotion?.now(now) ?? now;
      startedAt ??= now;
      if (now - startedAt + elapsed >= duration) {
        workWindow.dataset.streaming = 'false';
        $('.work-state').textContent = 'Done';
        return;
      }
      terminalFrame = requestAnimationFrame(tick);
    }
    terminalFrame = requestAnimationFrame(tick);
  }

  function closeInlinePanels() {
    steps.forEach(row => {
      row.querySelector('.inline-tool-panel').hidden = true;
      row.querySelector('button').setAttribute('aria-expanded', 'false');
    });
  }

  function cancelPanelAnimations() {
    panelAnimation?.cancel();
    panelContentAnimations.forEach(animation => animation.cancel());
    panelContentAnimations = [];
  }

  function revealTool() {
    if (reducedMotion.matches) return;
    const anchor = narrowScreen.matches ? 19 : 60;
    const fromRight = !narrowScreen.matches && workWindow.dataset.side === 'left';
    const strip = `${anchor - 1}px 0 calc(100% - ${anchor + 1}px) 0`;
    const point = `${anchor - 1}px ${fromRight ? '0' : 'calc(100% - 2px)'} calc(100% - ${anchor + 1}px) ${fromRight ? 'calc(100% - 2px)' : '0'}`;
    // Open from the cable endpoint without moving the window or its connector.
    panelAnimation = workWindow.animate([
      { clipPath: `inset(${point})`, backgroundColor: '#f6d64d', borderColor: '#f6d64d' },
      { clipPath: `inset(${strip})`, backgroundColor: '#f6d64d', borderColor: '#f6d64d', offset: .24 },
      { clipPath: 'inset(0)', backgroundColor: '#fffef8', borderColor: '#bdc9b6' }
    ], { duration: 560, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
    panelContentAnimations = ['.work-chrome', '.work-meta', '#work-title', '.backend-visual'].map((selector, index) => $(selector).animate([
      { clipPath: 'inset(0 0 100% 0)', opacity: 0, transform: 'translateY(-4px)' },
      { clipPath: 'inset(0)', opacity: 1, transform: 'none' }
    ], { duration: 340, delay: 100 + index * 60, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' }));
    scrollMotion?.trackTree(workWindow);
  }

  function hideTool() {
    clearStepTimeout(closeTimer);
    cancelAnimationFrame(inlineScrollFrame);
    cancelAnimationFrame(terminalFrame);
    workWindow.dataset.streaming = 'false';
    closeInlinePanels();
    stage.dataset.connected = 'false';
    steps.forEach(row => { row.dataset.inspected = 'false'; });
    cancelPanelAnimations();
    if (narrowScreen.matches || reducedMotion.matches) { workWindow.hidden = true; return; }
    panelAnimation = workWindow.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px) scale(.98)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    scrollMotion?.track(panelAnimation);
    panelAnimation.finished.then(() => { workWindow.hidden = true; }).catch(() => {});
  }

  function drawConnection() {
    if (narrowScreen.matches) { stage.dataset.connected = 'false'; return; }
    if (!sceneActive || selectedStep < 0 || workWindow.hidden) return;
    const rect = diagram.getBoundingClientRect();
    const source = steps[selectedStep].getBoundingClientRect();
    const target = workWindow.getBoundingClientRect();
    const leftSide = workWindow.dataset.side === 'left';
    const x1 = (leftSide && !narrowScreen.matches ? source.left - 6 : source.right + 6) - rect.left;
    const y1 = source.top + source.height / 2 - rect.top;
    let x2, y2, path;
    if (narrowScreen.matches) {
      x2 = target.left + target.width / 2 - rect.left;
      y2 = target.top - rect.top;
      const gutter = rect.width + 8;
      path = `M ${x1} ${y1} H ${gutter} V ${y2 - 16} H ${x2} V ${y2}`;
    } else {
      x2 = (leftSide ? target.right : target.left) - rect.left;
      y2 = target.top + 60 - rect.top;
      const bend = (x1 + x2) / 2;
      path = `M ${x1} ${y1} C ${bend} ${y1}, ${bend} ${y2}, ${x2} ${y2}`;
    }
    document.querySelectorAll('.tool-connection path').forEach(wire => wire.setAttribute('d', path));
    $('.connection-end').setAttribute('cx', x2);
    $('.connection-end').setAttribute('cy', y2);
    stage.dataset.connected = 'true';
  }

  function showTool(index, complete = false, inspect = false, elapsed = 0) {
    if (!sceneActive && !narrowScreen.matches) return;
    if (narrowScreen.matches && complete && !inspect) {
      selectedStep = index;
      if (!workWindow.hidden) hideTool();
      return;
    }
    const changed = index !== selectedStep;
    if (!inspect && !changed) {
      if (complete) {
        workWindow.dataset.state = 'complete';
        stage.dataset.toolState = 'complete';
      }
      return;
    }
    selectedStep = index;
    clearStepTimeout(closeTimer);
    cancelPanelAnimations();
    const inline = narrowScreen.matches;
    (inline ? steps[index].querySelector('.inline-tool-panel') : $('.work-area')).append(workWindow);
    steps.forEach((row, i) => {
      row.querySelector('.inline-tool-panel').hidden = !inline || i !== index;
      row.querySelector('button').setAttribute('aria-expanded', String(i === index));
    });
    workWindow.hidden = false;
    workWindow.dataset.side = index % 2 === 0 ? 'left' : 'right';
    const step = examples[exampleKey].steps[index];
    workWindow.dataset.state = complete ? 'complete' : 'working';
    stage.dataset.toolState = complete ? 'complete' : 'working';
    $('.work-state').textContent = complete ? 'Done' : 'Working…';
    $('.work-step').textContent = `${index + 1} / ${examples[exampleKey].steps.length}`;
    $('#work-title').textContent = workTitles[step[2]];
    $('.work-progress').innerHTML = examples[exampleKey].steps.map((_, i) => '<span data-state="' + (i < index ? 'complete' : i === index ? 'active' : 'pending') + '"></span>').join('');
    $('.backend-visual').innerHTML = backendVisual(step[2]);
    animateBackend(inspect || reducedMotion.matches || complete, elapsed);
    steps.forEach((row, i) => { row.dataset.inspected = String(i === index); });
    drawConnection();
    revealTool();
    if (inline) {
      cancelAnimationFrame(inlineScrollFrame);
      inlineScrollFrame = requestAnimationFrame(() => {
        if (workWindow.hidden || selectedStep !== index) return;
        $('.chat-conversation').scrollTo({ top: Math.max(0, steps[index].offsetTop - 12), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      });
    } else if (!inspect && !reducedMotion.matches) {
      closeTimer = setStepTimeout(hideTool, Math.max(0, toolStepDuration - 300 - elapsed));
    }
  }

  function inspectTool(index, toggle = false) {
    if (steps[index].querySelector('button').disabled) return;
    clearTimeout(hoverTimer);
    clearStepTimeout(closeTimer);
    if (!workWindow.hidden && selectedStep === index) {
      if (toggle && narrowScreen.matches) {
        inspectedStep = null;
        hideTool();
      } else inspectedStep = index;
      return;
    }
    inspectedStep = index;
    showTool(index, steps[index].dataset.state === 'complete', true);
  }

  function leaveTool() {
    if (narrowScreen.matches || inspectedStep === null) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      inspectedStep = null;
      hideTool();
      if (heroVisual.dataset.phase === 'checking') selectedStep = -1;
    }, 180);
  }

  function playConversation(instant = false) {
    conversationStarted = true;
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(inlineScrollFrame);
    clearTimeout(hoverTimer);
    inspectedStep = null;
    closeInlinePanels();
    $('.chat-conversation').scrollTop = 0;
    bubbleAnimation?.cancel();
    clearStepTimeout(closeTimer);
    cancelPanelAnimations();
    workWindow.hidden = true;
    cancelAnimationFrame(terminalFrame);
    selectedStep = -1;
    stage.dataset.connected = 'false';
    steps.forEach(row => { row.dataset.inspected = 'false'; });
    const example = examples[exampleKey];
    const typingStartsAt = 1000;
    const sendStartsAt = typingStartsAt + example.question.length * 12 + 140;
    const checkingStartsAt = sendStartsAt + 420;
    const stepDuration = toolStepDuration;
    const answerStartsAt = checkingStartsAt + example.steps.length * stepDuration;
    const answerDuration = example.answer.length * 8;
    let startedAt;
    let sent = false;
    function render(elapsed) {
      conversationElapsed = elapsed;
      const composing = elapsed < sendStartsAt;
      const answerStarted = elapsed >= answerStartsAt;
      const complete = elapsed >= answerStartsAt + answerDuration;
      heroVisual.dataset.phase = complete ? 'complete' : answerStarted ? 'answer' : elapsed >= checkingStartsAt ? 'checking' : composing ? 'composing' : 'sending';
      draft.textContent = composing ? example.question.slice(0, Math.floor(Math.max(0, elapsed - typingStartsAt) / 12)) : '';
      answer.textContent = answerStarted ? example.answer.slice(0, Math.floor((elapsed - answerStartsAt) / 8)) : '';
      draft.classList.toggle('is-typing', composing);
      answer.classList.toggle('is-typing', answerStarted && !complete);
      $('.markets-status-detail').textContent = answerStarted ? '' : ' is working…';
      const activeStep = Math.floor((elapsed - checkingStartsAt) / stepDuration);
      steps.forEach((row, index) => {
        row.dataset.state = index > activeStep ? 'pending' : index === activeStep && !answerStarted ? 'active' : 'complete';
        row.querySelector('button').disabled = (!sceneActive && !narrowScreen.matches) || row.hidden || row.dataset.state === 'pending';
      });
      if ((sceneActive || narrowScreen.matches) && inspectedStep === null && elapsed >= checkingStartsAt) {
        const index = Math.min(activeStep, example.steps.length - 1);
        showTool(index, answerStarted, false, answerStarted ? 0 : elapsed - checkingStartsAt - index * stepDuration);
      }
      if (!sent && !composing && elapsed < checkingStartsAt && !reducedMotion.matches) {
        sent = true;
        const origin = composerEntry.getBoundingClientRect();
        const destination = questionBubble.getBoundingClientRect();
        const style = getComputedStyle(questionBubble);
        bubbleAnimation = questionBubble.animate([
          { transform: `translate(${origin.left - parseFloat(style.paddingLeft) - destination.left}px, ${origin.top - parseFloat(style.paddingTop) - destination.top}px) scale(.98)`, opacity: .65 },
          { transform: 'translate(0, 0) scale(1)', opacity: 1 }
        ], { duration: 420, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        scrollMotion?.track(bubbleAnimation);
      }
      return complete;
    }
    renderConversation = render;
    if (instant || reducedMotion.matches) { render(Infinity); return; }
    render(0);
    function tick(now) {
      now = scrollMotion?.now(now) ?? now;
      startedAt ??= now;
      if (!render(now - startedAt)) animationFrame = requestAnimationFrame(tick);
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function setExample(key, replay = true) {
    exampleKey = key;
    const example = examples[key];
    question.textContent = example.question;
    $('.user-message .typing-measure').textContent = example.question;
    $('.composer-entry .typing-measure').textContent = example.question;
    $('.assistant-answer .typing-measure').textContent = example.answer;
    steps.forEach((row, index) => {
      row.hidden = index >= example.steps.length;
      if (row.hidden) return;
      row.querySelector('.activity-label').textContent = example.steps[index][0];
      row.querySelector('.activity-icon').className = `activity-icon activity-${example.steps[index][1]}`;
    });
    exampleChoices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
    if (replay) playConversation();
    requestGeometry();
  }

  function ensureConversation() {
    if (!conversationStarted) playConversation();
  }

  function cancelSnap() {
    snapAnimation?.cancel();
    cancelAnimationFrame(snapFrame);
  }

  function settleChat(direction) {
    cancelSnap();
    if (reducedMotion.matches) return;
    (direction > 0 ? $('.visual-container') : stage).dispatchEvent(new Event('dither-reset'));
    (direction > 0 ? stage : $('.visual-container')).dispatchEvent(new Event('dither-replay'));
    if (narrowScreen.matches) return;
    // Animate the inner window so the scroll-driven journey stays in control.
    const animation = $('.chat-window').animate([
      { transform: `translateY(${-8 * direction}px) scale(.988)` },
      { transform: `translateY(${3 * direction}px) scale(1.004)`, offset: .55 },
      { transform: `translateY(${-direction}px) scale(.999)`, offset: .8 },
      { transform: 'none' }
    ], { duration: 460, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    snapAnimation = animation;
    function followConnection() {
      drawConnection();
      snapFrame = requestAnimationFrame(followConnection);
    }
    snapFrame = requestAnimationFrame(followConnection);
    animation.finished.then(() => {
      if (snapAnimation !== animation) return;
      cancelAnimationFrame(snapFrame);
      drawConnection();
    }).catch(() => {});
  }

  function activateScene(active) {
    if (active === sceneActive) {
      if (active) ensureConversation();
      return;
    }
    const snapOnLanding = active && conversationStarted;
    cancelSnap();
    sceneActive = active;
    (active ? dock : home).append(heroVisual);
    stage.dataset.sceneActive = String(active);
    heroVisual.classList.toggle('is-docked', active);
    if (active) {
      stage.dataset.sceneVisited = 'true';
      ensureConversation();
      if (!narrowScreen.matches && heroVisual.dataset.phase === 'checking') {
        cancelPanelAnimations();
        workWindow.hidden = true;
        selectedStep = -1;
      }
      renderConversation(conversationElapsed);
    } else {
      if (!narrowScreen.matches) {
        clearTimeout(hoverTimer);
        inspectedStep = null;
        hideTool();
      }
      steps.forEach(row => { row.querySelector('button').disabled = !narrowScreen.matches || row.hidden || row.dataset.state === 'pending'; });
    }
    requestGeometry();
    if (snapOnLanding) settleChat(1);
    else if (!active && homeSnapArmed && $('.home-sentinel').getBoundingClientRect().top >= 100) {
      homeSnapArmed = false;
      settleChat(-1);
    }
  }

  function landingTop() {
    const remainingStage = stage.getBoundingClientRect().bottom - dock.getBoundingClientRect().top;
    return Math.max(100, innerHeight - remainingStage - 16);
  }

  function measurePreviewHeight() {
    const width = $('.chat-window').offsetWidth;
    if (!width || width === measuredPreviewWidth) return;
    measuredPreviewWidth = width;
    // Reserve the tallest conversation at this width, including both platform fonts.
    const probe = heroVisual.cloneNode(true);
    probe.setAttribute('aria-hidden', 'true');
    probe.setAttribute('inert', '');
    probe.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    probe.querySelector('.work-window')?.remove();
    probe.querySelectorAll('.inline-tool-panel').forEach(panel => { panel.hidden = true; });
    probe.dataset.phase = 'complete';
    probe.dataset.measuring = 'true';
    probe.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;visibility:hidden;pointer-events:none`;
    probe.querySelector('.chat-window').style.height = 'auto';
    document.body.append(probe);
    let height = 0;
    for (const platform of ['claude', 'chatgpt']) {
      probe.dataset.platform = platform;
      for (const example of Object.values(examples)) {
        for (const selector of ['.user-message .typing-measure', '.user-message .typed-text', '.composer-entry .typing-measure']) {
          probe.querySelector(selector).textContent = example.question;
        }
        for (const selector of ['.assistant-answer .typing-measure', '.assistant-answer .typed-text']) {
          probe.querySelector(selector).textContent = example.answer;
        }
        probe.querySelectorAll('.markets-activity li').forEach((row, index) => {
          row.hidden = index >= example.steps.length;
          if (!row.hidden) row.querySelector('.activity-label').textContent = example.steps[index][0];
        });
        height = Math.max(height, probe.querySelector('.chat-window').offsetHeight);
      }
    }
    probe.remove();
    heroVisual.style.setProperty('--chat-preview-height', `${height}px`);
  }

  function measureHandoff() {
    const useScroll = scrollSupported && !reducedMotion.matches && !narrowScreen.matches;
    document.body.classList.toggle('has-handoff', useScroll);
    document.body.classList.toggle('no-scroll-handoff', !useScroll);
    measurePreviewHeight();
    const origin = home.getBoundingClientRect();
    const destination = dock.getBoundingClientRect();
    if (heroVisual.parentElement === home) home.style.height = `${heroVisual.offsetHeight}px`;
    dock.style.minHeight = `${heroVisual.offsetHeight}px`;
    // Read destination again because reserving the original space can move the section.
    const finalDestination = dock.getBoundingClientRect();
    const start = Math.max(0, origin.top + scrollY - 100);
    const end = Math.max(start + 1, finalDestination.top + scrollY - landingTop());
    const style = document.body.style;
    style.setProperty('--origin-width', `${origin.width}px`);
    style.setProperty('--dock-width', `${destination.width}px`);
    style.setProperty('--handoff-x', `${finalDestination.left - origin.left}px`);
    style.setProperty('--handoff-y', `${finalDestination.top - origin.top}px`);
    style.setProperty('--handoff-start', `${start}px`);
    style.setProperty('--handoff-end', `${end}px`);
    drawConnection();
  }

  function requestGeometry() {
    cancelAnimationFrame(geometryFrame);
    geometryFrame = requestAnimationFrame(measureHandoff);
  }

  function observeDock() {
    cancelSnap();
    measureHandoff();
    dockObserver?.disconnect();
    const boundary = narrowScreen.matches ? Math.max(100, innerHeight - 180) : landingTop();
    dockObserver = new IntersectionObserver(() => {
      activateScene($('.dock-sentinel').getBoundingClientRect().top <= boundary);
    }, { rootMargin: `-${boundary}px 0px 0px 0px` });
    dockObserver.observe($('.dock-sentinel'));
    returnObserver?.disconnect();
    returnObserver = new IntersectionObserver(entries => {
      if (dock.getBoundingClientRect().top > boundary) activateScene(false);
      else if (!entries[0].isIntersecting) activateScene(true);
    });
    returnObserver.observe(home);
    homeObserver?.disconnect();
    homeObserver = new IntersectionObserver(() => {
      if ($('.home-sentinel').getBoundingClientRect().top < 100) {
        homeSnapArmed = true;
        if (!sceneActive) cancelSnap();
      } else if (homeSnapArmed && !sceneActive) {
        homeSnapArmed = false;
        settleChat(-1);
      }
    }, { rootMargin: '-100px 0px 0px 0px' });
    homeObserver.observe($('.home-sentinel'));
    requestGeometry();
  }

  $('[data-connect]').addEventListener('click', () => {
    $('#get-connected')?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  platformChoices.forEach(button => button.addEventListener('click', () => {
    if (heroVisual.dataset.platform === button.dataset.platformChoice) return;
    heroVisual.dataset.platform = button.dataset.platformChoice;
    platformChoices.forEach(choice => choice.setAttribute('aria-pressed', String(choice.dataset.platformChoice === button.dataset.platformChoice)));
    $('.harness-name').textContent = button.textContent.trim();
    $('#chat-preview').setAttribute('aria-label', `${button.textContent.trim()} conversation`);
    playConversation();
    requestGeometry();
  }));
  exampleChoices.forEach(button => button.addEventListener('click', () => {
    activateScene(true);
    setExample(button.dataset.example);
    const rect = dock.getBoundingClientRect();
    if (rect.top >= innerHeight || rect.bottom <= 0) {
      dock.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }));
  steps.forEach((row, index) => {
    const button = row.querySelector('button');
    button.addEventListener('click', () => inspectTool(index, true));
    button.addEventListener('pointerenter', () => { if (!narrowScreen.matches) inspectTool(index); });
    button.addEventListener('pointerleave', leaveTool);
    button.addEventListener('focus', () => { if (!narrowScreen.matches) inspectTool(index); });
    button.addEventListener('blur', leaveTool);
  });
  workWindow.addEventListener('pointerenter', () => clearTimeout(hoverTimer));
  workWindow.addEventListener('pointerleave', leaveTool);
  $('.work-close').addEventListener('click', () => { inspectedStep = null; hideTool(); });
  reducedMotion.addEventListener('change', () => { observeDock(); playConversation(); });
  narrowScreen.addEventListener('change', () => { measuredPreviewWidth = undefined; observeDock(); playConversation(); });
  const resize = new ResizeObserver(requestGeometry);
  resize.observe(document.documentElement);
  document.fonts.ready.then(() => { measuredPreviewWidth = undefined; observeDock(); });
  window.addEventListener('resize', observeDock, { passive: true });
  window.addEventListener('pageshow', observeDock);
  heroVisual.dataset.phase = 'waiting';
  observeDock();

  if (reducedMotion.matches) ensureConversation();
  else {
    const introObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { ensureConversation(); introObserver.disconnect(); }
    }, { threshold: .2 });
    introObserver.observe(home);
  }
})();
