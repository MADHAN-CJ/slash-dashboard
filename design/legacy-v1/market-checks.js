(() => {
  const section = document.querySelector('.market-checks');
  if (!section) return;

  const scenes = [...section.querySelectorAll('[data-check]')];
  const links = [...section.querySelectorAll('[data-check-link]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const schedule = window.scrollMotion?.setTimeout || setTimeout;
  const cancel = window.scrollMotion?.clearTimeout || clearTimeout;
  const ns = 'http://www.w3.org/2000/svg';
  const number = new Intl.NumberFormat('en-IN');

  function node(tag, attrs = {}, text) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function add(parent, tag, attrs, text) {
    const element = node(tag, attrs, text);
    parent.append(element);
    return element;
  }
  function label(svg, x, y, text, attrs = {}) {
    return add(svg, 'text', { x, y, ...attrs }, text);
  }
  function line(svg, x1, y1, x2, y2, attrs = {}) {
    return add(svg, 'line', { x1, y1, x2, y2, ...attrs });
  }
  const scale = (min, max, top, bottom) => value => bottom - (value - min) / (max - min) * (bottom - top);

  function svgChart(width, height, description) {
    const svg = node('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': description });
    add(svg, 'title', {}, description);
    return svg;
  }
  function grid(svg, y, ticks, right, format = number.format) {
    ticks.forEach(value => {
      line(svg, 5, y(value), right, y(value), { class: 'check-grid-line', pathLength: 1 });
      label(svg, right + 8, y(value) + 4, format(value));
    });
  }
  function candles(svg, values, x, y, step) {
    const series = add(svg, 'g', { class: 'check-series' });
    values.forEach((candle, index) => {
      const group = add(series, 'g', {
        class: `check-candle ${candle.close >= candle.open ? 'check-up' : 'check-down'}`,
        style: `--item:${index}`,
        'data-low': candle.low,
      });
      add(group, 'title', {}, `Open ${number.format(candle.open)}, high ${number.format(candle.high)}, low ${number.format(candle.low)}, close ${number.format(candle.close)}`);
      line(group, x(index), y(candle.high), x(index), y(candle.low), { class: 'check-candle-wick' });
      add(group, 'rect', { x: x(index) - step * .29, y: Math.min(y(candle.open), y(candle.close)), width: step * .58, height: Math.max(2, Math.abs(y(candle.close) - y(candle.open))), rx: .5 });
    });
  }

  function scan(svg, right, top, bottom, id) {
    const gradient = add(add(svg, 'defs'), 'linearGradient', { id, x1: '0%', x2: '100%' });
    add(gradient, 'stop', { offset: '0%', 'stop-color': '#d2deb6', 'stop-opacity': 0 });
    add(gradient, 'stop', { offset: '100%', 'stop-color': '#afc58e', 'stop-opacity': .32 });
    const sweep = add(svg, 'g', { class: 'check-scan', style: `--scan-width:${right}px`, 'aria-hidden': 'true' });
    add(sweep, 'rect', { x: -40, y: top, width: 40, height: bottom - top, fill: `url(#${id})` });
    line(sweep, 0, top, 0, bottom, { stroke: '#8ca670', 'stroke-width': 1 });
  }

  function findingPoint(svg, x, y, index, className = 'check-touch') {
    add(svg, 'circle', { cx: x, cy: y, r: 12, class: 'check-point-ripple', style: `--point:${index}`, 'aria-hidden': 'true' });
    add(svg, 'circle', { cx: x, cy: y, r: 4.5, class: className, style: `--point:${index}` });
  }

  function levels(width) {
    const svg = svgChart(width, 300, 'Toyota (Tokyo: 7203) tested support at ¥2,950 twice, with resistance at ¥3,080.');
    const right = width - 62;
    const step = (right - 10) / 28;
    const x = index => 10 + (index + .5) * step;
    const y = scale(2924, 3106, 16, 266);
    const closes = [2992,3004,3022,3036,3057,3074,3054,3039,3025,3004,2982,2965,2960,2973,2987,3004,3022,3043,3074,3052,3041,3023,3005,2987,2968,2961,2973,2989];
    const values = closes.map((close, index) => {
      const open = index ? closes[index - 1] : 2979;
      const spread = 3 + index % 4;
      return { open, close, high: Math.max(open, close) + spread, low: Math.min(open, close) - spread };
    });
    values[5].high = values[18].high = 3080;
    values[12].low = values[25].low = 2950;
    grid(svg, y, [2950, 3015, 3080], right, value => `¥${number.format(value)}`);
    add(svg, 'rect', { x: 5, y: y(2956), width: right - 5, height: y(2944) - y(2956), fill: '#dbe9ce', class: 'check-support-band' });
    candles(svg, values, x, y, step);
    scan(svg, right, 16, 266, 'levels-read-sweep');
    line(svg, 5, y(2950), right, y(2950), { class: 'check-level-line', pathLength: 1, 'data-level': 2950 });
    line(svg, 5, y(3080), right, y(3080), { class: 'check-level-line check-resistance', pathLength: 1, 'data-level': 3080 });
    [12, 25].forEach((index, point) => {
      findingPoint(svg, x(index), y(2950), point);
      add(svg, 'rect', { x: x(index) - 65, y: y(2950) - 31, width: 56, height: 21, rx: 5, fill: '#fffef9', stroke: '#dce6d4', class: 'check-retest-backdrop', style: `--point:${point}` });
      label(svg, x(index) - 37, y(2950) - 16, `Retest ${point + 1}`, { class: 'check-retest-label', 'text-anchor': 'middle', style: `--point:${point}` });
    });
    label(svg, 10, y(3080) - 10, 'RESISTANCE', { class: 'check-chart-label', 'font-size': 11 });
    label(svg, 10, y(2950) + 27, 'SUPPORT ZONE', { class: 'check-chart-label', 'font-size': 11 });
    ['13:00', '14:00', '15:05'].forEach((time, i) => label(svg, x([1, 13, 26][i]), 295, time, { 'text-anchor': 'middle' }));
    return svg;
  }

  function options(width) {
    const svg = svgChart(width, 300, 'Nifty option chain: largest put open interest at 23,000 and largest call open interest at 23,200. Open interest in lakh contracts.');
    const right = width - 30;
    const step = (right - 8) / 6;
    const y = scale(0, 6.7, 40, 266);
    const strikes = [22800,22900,23000,23100,23200,23300];
    const puts = [2.2,3.4,5.9,3,1.2,.6];
    const calls = [.4,1,2.1,3.3,5.6,2.8];
    grid(svg, y, [0,2,4,6], right, value => `${value}`);
    strikes.forEach((strike, index) => {
      const center = 8 + (index + .5) * step;
      if (index === 2 || index === 4) add(svg, 'rect', {
        x: center - step * .39, y: 10, width: step * .78, height: 256, rx: 7,
        fill: index === 2 ? '#e8f0e2' : '#f6e9e2', class: 'check-wall-area',
      });
      [puts, calls].forEach((values, side) => {
        const value = values[index];
        const major = side === 0 ? index === 2 : index === 4;
        const bar = add(svg, 'rect', {
          x: center + (side ? 2 : -step * .3), y: y(value), width: step * .3 - 2, height: y(0) - y(value), rx: 3,
          fill: side ? '#c47e70' : '#69966c', opacity: major ? 1 : .42,
          class: `check-oi-bar${major ? ' check-oi-major' : ''}`, style: `--item:${index * 2 + side};--bar-opacity:${major ? 1 : .42}`, 'data-strike': strike, 'data-side': side ? 'call' : 'put', 'data-oi': value,
        });
        add(bar, 'title', {}, `${number.format(strike)} ${side ? 'call' : 'put'} OI: ${value} lakh contracts`);
        if (major) {
          label(svg, center + (side ? step * .15 : -step * .15), y(value) - 10, value.toFixed(1), { class: 'check-chart-label', 'text-anchor': 'middle' });
          label(svg, center, 31, side ? 'Call wall' : 'Put wall', { class: 'check-wall-label', 'text-anchor': 'middle' });
        }
      });
      // Fewer labels on narrow screens, retaining both wall strikes.
      if (width >= 420 || index % 2 === 0) label(svg, center, 290, width < 420 ? `${(strike / 1000).toFixed(1)}k` : number.format(strike), { 'text-anchor': 'middle' });
    });
    return svg;
  }

  function indicators(width) {
    const svg = svgChart(width, 350, 'On the NVIDIA (Nasdaq: NVDA) 1-hour chart, price makes a lower low from $228 to $224 while RSI makes a higher low from 27 to 34, showing bullish divergence.');
    const right = width - 62;
    const step = (right - 10) / 24;
    const x = index => 10 + (index + .5) * step;
    const priceY = scale(220, 245, 26, 192);
    const rsiY = scale(10, 90, 234, 322);
    const closes = [239.5,241,238.5,236.2,234,232.5,230,229.2,232,235.2,238,240.5,238.5,236,233,230.5,228,226,225.8,229.5,232.5,235,234,237];
    const values = closes.map((close, index) => {
      const open = index ? closes[index - 1] : 238;
      return { open, close, high: Math.max(open, close) + .9, low: Math.min(open, close) - .7 };
    });
    values[7].low = 228;
    values[18].low = 224;
    grid(svg, priceY, [224,232,240], right, value => `$${value}`);
    label(svg, 5, 15, 'PRICE', { class: 'check-chart-label', 'font-size': 11 });
    candles(svg, values, x, priceY, step);
    scan(svg, right, 26, 192, 'indicators-read-sweep');
    line(svg, x(7), priceY(228), x(18), priceY(224), { class: 'check-divergence check-price-divergence', 'data-first-low': 228, 'data-second-low': 224 });
    label(svg, x(18), priceY(224) + 22, 'Lower low', { 'text-anchor': 'middle', class: 'check-chart-label' });
    line(svg, 5, 218, width - 5, 218, { class: 'check-grid-line' });
    label(svg, 5, 237, 'RSI (14)', { class: 'check-chart-label', 'font-size': 11 });
    [30,70].forEach(value => {
      line(svg, 5, rsiY(value), right, rsiY(value), { class: 'check-grid-line', 'stroke-dasharray': '3 4' });
      label(svg, right + 8, rsiY(value) + 4, value);
    });
    const rsi = [56,61,54,47,40,34,29,27,36,45,52,59,53,48,43,39,36,35,34,43,49,54,51,58];
    add(svg, 'path', { d: rsi.map((value,index) => `${index ? 'L' : 'M'}${x(index)},${rsiY(value)}`).join(' '), class: 'check-rsi-line', pathLength: 1 });
    line(svg, x(7), rsiY(27), x(18), rsiY(34), { class: 'check-divergence check-rsi-divergence', 'data-first-low': 27, 'data-second-low': 34 });
    [7,18].forEach((index, point) => {
      findingPoint(svg, x(index), priceY(values[index].low), point, 'check-divergence-point');
      findingPoint(svg, x(index), rsiY(rsi[index]), point, 'check-divergence-point');
    });
    label(svg, x(18), rsiY(34) + 25, 'Higher low', { 'text-anchor': 'middle', class: 'check-chart-label' });
    return svg;
  }

  const renderers = { levels, options, indicators };
  const widths = new WeakMap();
  function render(container) {
    const width = Math.round(container.getBoundingClientRect().width);
    if (width < 1 || widths.get(container) === width) return;
    widths.set(container, width);
    container.replaceChildren(renderers[container.dataset.checkChart](width));
  }
  const charts = [...section.querySelectorAll('[data-check-chart]')];
  const copy = section.querySelector('.checks-copy');
  function centerCopy() {
    // Keep the sticky box content-sized so it releases at the final card's bottom.
    copy.style.setProperty('--checks-copy-top', `${Math.max(0, (window.innerHeight - copy.getBoundingClientRect().height) / 2)}px`);
  }
  centerCopy();
  window.addEventListener('resize', centerCopy, { passive: true });
  charts.forEach(render);
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(entries => entries.forEach(entry => entry.target === copy ? centerCopy() : render(entry.target)));
    resize.observe(copy);
    charts.forEach(chart => resize.observe(chart));
  } else {
    window.addEventListener('resize', () => charts.forEach(render), { passive: true });
  }

  function activate(scene) {
    links.forEach(link => {
      if (link.dataset.checkLink === scene.dataset.check) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  const revealTimers = new WeakMap();
  function play(scene) {
    cancel(revealTimers.get(scene));
    delete scene.dataset.animate;
    scene.dataset.revealed = 'true';
    scene.dispatchEvent(new CustomEvent('dither-replay'));
    if (motion.matches) return;
    // Commit the settled state before replaying the same CSS timeline.
    void scene.offsetWidth;
    scene.dataset.animate = 'true';
    window.scrollMotion?.trackTree(scene);
    revealTimers.set(scene, schedule(() => delete scene.dataset.animate, 3200));
  }
  scenes.forEach(scene => {
    const replay = scene.querySelector('.check-replay');
    if (!replay) return;
    replay.hidden = false;
    replay.setAttribute('aria-label', `Replay ${scene.getAttribute('aria-label')}`);
    replay.addEventListener('click', () => play(scene));
  });
  links.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const scene = scenes.find(item => item.dataset.check === link.dataset.checkLink);
    if (!scene) return;
    event.preventDefault();
    scene.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'center' });
    activate(scene);
  }));

  if ('IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visible.add(entry.target);
          if (!entry.target.dataset.revealed) play(entry.target);
        } else visible.delete(entry.target);
      });
      const center = window.innerHeight / 2;
      const nearest = [...visible].sort((a,b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return Math.abs(rectA.top + rectA.height / 2 - center) - Math.abs(rectB.top + rectB.height / 2 - center);
      })[0];
      if (nearest) activate(nearest);
    // Start when the question reaches the reading area, rather than the bottom edge.
    }, { rootMargin: '-10% 0px -40% 0px', threshold: [0,.25,.5,.75,1] });
    scenes.forEach(scene => {
      if (!motion.matches) scene.dataset.animate = 'pending';
      observer.observe(scene);
    });
  }
})();
