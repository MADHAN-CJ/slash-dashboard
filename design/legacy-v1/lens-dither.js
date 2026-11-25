// Original-colour 8×8 Bayer dithering, matching the page's Paper background shaders.
window.createLensDither = (lens, video, onError, { keepLensClear = true, fadeTop = false } = {}) => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  let frame = 0, running = false, startedAt, ratio = 1, resizeObserver;
  let program, buffer, texture;
  const videoFrames = typeof video.requestVideoFrameCallback === 'function';
  function stop() {
    running = false;
    if (videoFrames) video.cancelVideoFrameCallback(frame);
    else cancelAnimationFrame(frame);
  }
  function dispose() {
    stop();
    resizeObserver?.disconnect();
    delete lens.dataset.videoDither;
    canvas.remove();
    if (texture) gl.deleteTexture(texture);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
  }
  try {
    function shader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('Video dither shader unavailable');
      }
      return shader;
    }
    const vertex = shader(gl.VERTEX_SHADER, `#version 300 es
      in vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `);
    const fragment = shader(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float;
      uniform sampler2D image;
      uniform vec2 resolution;
      uniform float pixelSize;
      uniform float imageAspect;
      uniform bool keepLensClear;
      uniform bool fadeTop;
      out vec4 color;
      const int bayer[64] = int[64](
        0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,
        12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,
        3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,
        15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21
      );
      void main() {
        vec2 grid = (gl_FragCoord.xy - 0.5 * resolution) / pixelSize;
        vec2 sampled = (floor(grid) + 0.5) * pixelSize;
        float coverWidth = max(resolution.x / imageAspect, resolution.y) * imageAspect;
        vec2 uv = vec2(sampled.x / coverWidth + 0.5, 0.5 - sampled.y / (coverWidth / imageAspect));
        vec3 rgb = texture(image, uv).rgb;
        float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
        ivec2 cell = ivec2(mod(floor(grid), 8.0));
        float noise = float(bayer[cell.y * 8 + cell.x]) / 64.0 - 0.5;
        float quantized = floor(clamp(lum + noise / 4.0, 0.0, 1.0) * 4.0 + 0.5) / 4.0;
        vec3 dithered = rgb / max(lum, 0.001) * quantized;
        vec2 point = gl_FragCoord.xy - 0.5 * resolution;
        vec2 cleanUV = vec2(point.x / coverWidth + 0.5, 0.5 - point.y / (coverWidth / imageAspect));
        vec3 clean = texture(image, cleanUV).rgb;
        // Follow the tilted glass lens in the source video, with a feathered rim.
        vec2 offset = cleanUV - vec2(0.5, 0.484);
        vec2 lensPoint = vec2(dot(offset, vec2(0.6561, -0.7547)), dot(offset, vec2(0.7547, 0.6561)));
        float lensDistance = length(lensPoint / vec2(0.425, 0.255));
        float outsideLens = smoothstep(0.98, 1.10, lensDistance);
        float strength = (keepLensClear ? outsideLens : 1.0) * (fadeTop ? smoothstep(0.02, 0.5, cleanUV.y) : 1.0);
        color = vec4(mix(clean, dithered, strength), 1.0);
      }
    `);
    program = gl.createProgram();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Video dither unavailable');
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'image'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'keepLensClear'), keepLensClear ? 1 : 0);
    gl.uniform1i(gl.getUniformLocation(program, 'fadeTop'), fadeTop ? 1 : 0);
    const resolution = gl.getUniformLocation(program, 'resolution');
    const size = gl.getUniformLocation(program, 'pixelSize');
    const aspect = gl.getUniformLocation(program, 'imageAspect');
    function resize() {
      const { width, height } = lens.getBoundingClientRect();
      ratio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(600000 / Math.max(1, width * height)));
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    }
    function draw(now) {
      if (!running) return;
      if (video.readyState >= 2) {
        startedAt ??= now;
        const progress = Math.min((now - startedAt) / 500, 1);
        const pixelSize = 10 + (2 - 10) * progress;
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.uniform1f(size, pixelSize * ratio);
          gl.uniform1f(aspect, video.videoWidth / video.videoHeight);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          lens.dataset.videoDither = 'ready';
          canvas.dataset.gridSize = pixelSize.toFixed(2);
          canvas.dataset.ditherState = progress === 1 ? 'complete' : 'animating';
        } catch (error) {
          dispose(); onError(); return;
        }
      }
      frame = videoFrames ? video.requestVideoFrameCallback(draw) : requestAnimationFrame(draw);
    }
    canvas.className = 'video-dither-canvas';
    canvas.dataset.ditherType = '8x8';
    canvas.setAttribute('aria-hidden', 'true');
    lens.append(canvas);
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(lens);
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); onError(); });
    return {
      start(replay) { stop(); if (replay) startedAt = undefined; running = true; draw(performance.now()); },
      stop, dispose
    };
  } catch (error) {
    dispose();
    return null;
  }
};
